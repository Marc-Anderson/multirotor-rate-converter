from scipy.optimize import curve_fit
import math

# load the config file containing all of the rate data
from . import fc_firmware_constants

# the order of the below values is swapped between the ui, and the code
# i left it this way for consistency with their origin projects since thats the way they do it
# * in the code, the rate values are in this order
#     * rate, rc_rate, rc_expo
# * on the website, the rate values are in this order
#     * rc_rate, rate, rc_expo


# region utility functions


def constrain(value, minValue, maxValue):
    if isinstance(value, int) | isinstance(value, float):
        return max(minValue, min(value, maxValue))
    return [max(minValue, min(x, maxValue)) for x in value]


def mse(y_true, y_pred):
    """
    given an array of truthy values, and an array or unknown, calcluate the mse

    assumes the dataset is the same length and evenly distributed
    """
    # Calculate the squared differences between corresponding elements
    squared_diffs = [(true - pred) ** 2 for true, pred in zip(y_true, y_pred)]
    # Calculate the mean of the squared differences
    mean_squared_error = sum(squared_diffs) / len(squared_diffs)
    return mean_squared_error


# region rate calculation


def getBetaflightRates(
    rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo, superExpoActive, limit
):
    if rcRate > 2:
        rcRate = rcRate + (rcRate - 2) * 14.54

    expoPower = 3
    rcRateConstant = 200

    if rcExpo > 0:
        rcCommandf = rcCommandf * (rcCommandfAbs**expoPower) * rcExpo + rcCommandf * (
            1 - rcExpo
        )

    if superExpoActive:
        rcFactor = 1 / constrain(1 - rcCommandfAbs * rate, 0.01, 1)
        angularVel = (
            rcRateConstant * rcRate * rcCommandf
        )  # 200 should be variable checked on version (older versions it's 205,9)
        angularVel = angularVel * rcFactor
    else:
        angularVel = (
            ((rate * 100) + 27) * rcCommandf / 16
        ) / 4.1  # Only applies to old versions ?

    angularVel = constrain(angularVel, -1 * limit, limit)  # Rate limit from profile

    return angularVel


def getRaceflightRates(rcCommandf, rate, rcRate, rcExpo):
    angularVel = (1 + 0.01 * rcExpo * (rcCommandf * rcCommandf - 1.0)) * rcCommandf
    angularVel = angularVel * (rcRate + (abs(angularVel) * rcRate * rate * 0.01))
    return angularVel


def getKISSRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo):
    kissRpy = 1 - rcCommandfAbs * rate
    kissTempCurve = rcCommandf * rcCommandf
    rcCommandf = ((rcCommandf * kissTempCurve) * rcExpo + rcCommandf * (1 - rcExpo)) * (
        rcRate / 10
    )
    return (2000.0 * (1.0 / kissRpy)) * rcCommandf


def getActualRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo):
    expof = rcCommandfAbs * (((rcCommandf**5) * rcExpo) + (rcCommandf * (1 - rcExpo)))
    angularVel = max(0, rate - rcRate)
    angularVel = (rcCommandf * rcRate) + (angularVel * expof)
    return angularVel


def getQuickRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo):
    rcRate = rcRate * 200
    rate = max(rate, rcRate)
    superExpoConfig = ((rate / rcRate) - 1) / (rate / rcRate)
    curve = (rcCommandfAbs**3) * rcExpo + rcCommandfAbs * (1 - rcExpo)
    angularVel = 1.0 / (1.0 - (curve * superExpoConfig))
    angularVel = rcCommandf * rcRate * angularVel
    return angularVel


def getInavRates(rc_commandf, rate, rc_rate, rc_expo):
    """
    Compute INAV stick rate output (degrees/second) from RC input.

    Args:
        rc_commandf (float): Raw RC input in the range 1000–2000.
        rate (float): Max rate in degrees per second.
        rc_rate (float): Unused.
        rc_expo (float): Expo value in [0, 1].

    Returns:
        float: Output in degrees per second.

    this calculation is based on a kind redditor and their desmos calculator:
    - https://www.desmos.com/calculator/7ph8s3vbhp
    - https://www.reddit.com/r/Multicopter/comments/1isj05g/updated_graphing_calculator_added_inav_rates/
    """

    # Convert RC input to stick deflection in range [-500, 500]
    stick_deflection = rc_commandf * 500

    # Convert to -5.0 to 5.0 range
    tmpf = stick_deflection / 100.0

    # INAV internal rate calculation
    rate_cmd = ((2500.0 + rc_expo * (tmpf * tmpf - 25.0)) * tmpf) / 25.0

    # Convert to degrees per second
    return (rate_cmd / 500.0) * rate


def inav_rate_math(x, i, r):
    """
    Mathematically simplified INAV rate curve.

    Args:
        x (float): Normalized stick input [-1, 1].
        i (float): Expo in [0, 1].
        r (float): Max rate (deg/s).

    Returns:
        float: Output rate (deg/s).
    """
    return (1 + i * (x * x - 1)) * x * r


# print(getBetaflightRates(.6, .6, .7, 1, .5, True, 2000))
# print(getRaceflightRates(.6, 80, 370, 50))
# print(getKISSRates(.6, .6, .7, 1, 0))
# print(getActualRates(.6, .6, 670, 200, .54))
# print(getQuickRates(.6, .6, 670, 1, 0))


# get degrees per second value at any given rc command
def getDegreesPerSecondAtRcCommand(rateType, rcCommandf, rate, rcRate, rcExpo):

    rcCommandfAbs = abs(rcCommandf)

    if rateType == "betaflight":
        # print("generating betaflight")
        anglerate = getBetaflightRates(
            rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo, True, 2000
        )
    elif rateType == "raceflight":
        # print("generating raceflight")
        anglerate = getRaceflightRates(rcCommandf, rate, rcRate, rcExpo)
    elif rateType == "kiss":
        # print("generating kiss")
        anglerate = getKISSRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo)
    elif rateType == "actual":
        # print("generating actual")
        anglerate = getActualRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo)
    elif rateType == "quickrates":
        # print("generating quickrates")
        anglerate = getQuickRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo)
    elif rateType == "inavflight":
        # print("generating inavflight")
        anglerate = getInavRates(rcCommandf, rate, rcRate, rcExpo)
    else:
        return 0

    return float(anglerate)


def generateCurve(rateType, rate, rc_rate, rc_expo, num_points=20):

    # Evenly spaced values between 0 and 1 (inclusive)
    rcValues = [i / num_points for i in range(num_points + 1)]

    # Convert rcValues into actual curve output (degrees/sec)
    return [
        getDegreesPerSecondAtRcCommand(rateType, val, rate, rc_rate, rc_expo)
        for val in rcValues
    ]


# region rate validation functions


def validate_data(srcRateType, tgtRateType, src_rate, src_rc_rate, src_rc_expo):
    """
    ensure that the input rate values and types are within the acceptable ranges
    """
    # identify the supported rate types
    supported_rate_types = fc_firmware_constants.keys()

    # validate the input rate types
    if tgtRateType not in supported_rate_types:
        raise ValueError(f"unsupported tgtRateType: {tgtRateType}")
    if srcRateType not in supported_rate_types:
        raise ValueError(f"unsupported srcRateType: {srcRateType}")

    # collect the min and max values for the source rate type
    srcRateMin = float(fc_firmware_constants[srcRateType]["rateValues"]["rate"]["min"])
    srcRcRateMin = float(
        fc_firmware_constants[srcRateType]["rateValues"]["rc_rate"]["min"]
    )
    srcRcExpoMin = float(
        fc_firmware_constants[srcRateType]["rateValues"]["rc_expo"]["min"]
    )
    #
    srcRateMax = float(fc_firmware_constants[srcRateType]["rateValues"]["rate"]["max"])
    srcRcRateMax = float(
        fc_firmware_constants[srcRateType]["rateValues"]["rc_rate"]["max"]
    )
    srcRcExpoMax = float(
        fc_firmware_constants[srcRateType]["rateValues"]["rc_expo"]["max"]
    )

    # validate the input values
    if src_rate < srcRateMin or src_rate > srcRateMax:
        raise ValueError(f"source rate out of range: {src_rate}")
    elif src_rc_rate < srcRcRateMin or src_rc_rate > srcRcRateMax:
        raise ValueError(f"source rc_rate out of range: {src_rc_rate}")
    elif src_rc_expo < srcRcExpoMin or src_rc_expo > srcRcExpoMax:
        raise ValueError(f"source rc_expo out of range: {src_rc_expo}")

    return True


# region rate fitting functions


def getFitValues(
    srcRateType,
    tgtRateType,
    src_rate,
    src_rc_rate,
    src_rc_expo,
    number_of_points_to_fit=10,
):
    """
    fit the source rates to the target rates and return the fitted parameters

    Args:
        src_rate_type(str): source rate type ('betaflight', 'raceflight', 'kiss', 'actual', 'quickrates')
        tgt_rate_type(str): target rate type
        src_rate(float): source rate value
        src_rc_rate(float): source rc rate value
        src_rc_expo(float): source rc expo value

    Returns:
        formatted_fit_data(dict): formatted fit data

        Example:
            {'srcRateType': 'betaflight', 'src_rate': 0.7, 'src_rc_rate': 1, 'src_rc_expo': 0.5, 'tgtRateType': 'raceflight', 'tgt_rate': 188, 'tgt_rc_rate': 224, 'tgt_rc_expo': 69, 'error': 78.12}
    """

    validate_data(srcRateType, tgtRateType, src_rate, src_rc_rate, src_rc_expo)

    # x = evenly spaced steps corresponding to rc input steps between 0 and 1
    x_axis_values = [x / 10 for x in range(0, number_of_points_to_fit + 1)]

    # y = values from source curve
    y_values_src = generateCurve(
        srcRateType, src_rate, src_rc_rate, src_rc_expo, number_of_points_to_fit
    )

    def function_to_fit(x, a, b, c):
        return [getDegreesPerSecondAtRcCommand(tgtRateType, z, a, b, c) for z in x]

    rate_keys = ["rate", "rc_rate", "rc_expo"]
    target_rate_data = fc_firmware_constants[tgtRateType]["rateValues"]
    lower_bounds = [target_rate_data[rate_key]["min"] for rate_key in rate_keys]
    upper_bounds = [target_rate_data[rate_key]["max"] for rate_key in rate_keys]
    initial_guess = [
        target_rate_data[rate_key]["default"] / 2 for rate_key in rate_keys
    ]

    def get_fit_results(
        function_to_fit,
        x_axis_values,
        y_values_src,
        initial_guess,
        bounds,
        tgt_rate_type,
    ):
        popt, pcov = curve_fit(
            function_to_fit,
            x_axis_values,
            y_values_src,
            p0=initial_guess,
            bounds=bounds,
        )
        optimized_rate_values = popt
        return optimized_rate_values

    optimized_rate_values = get_fit_results(
        function_to_fit,
        x_axis_values,
        y_values_src,
        initial_guess,
        (lower_bounds, upper_bounds),
        tgtRateType,
    )

    # format the results
    formatted_fit_data = format_fit_results(
        optimized_rate_values,
        tgtRateType,
        srcRateType,
        src_rate,
        src_rc_rate,
        src_rc_expo,
    )

    return formatted_fit_data


# region format results


def format_fit_results(
    denormalized_rate_values,
    tgtRateType,
    srcRateType,
    src_rate,
    src_rc_rate,
    src_rc_expo,
):
    """
    format the fit results into a dictionary for returning to the client

    # todo: 10/17/24 - i changed raceflight from ceil to floor, because they seemed to fit better
    # 20250412 - changed back, review this in the future
    """
    if tgtRateType == "raceflight" or tgtRateType == "inavflight":
        rate = int(math.ceil((denormalized_rate_values[0])))
        rc_rate = int(math.ceil((denormalized_rate_values[1])))
        rc_expo = int(math.ceil((denormalized_rate_values[2])))
    elif tgtRateType == "actual":
        rate = int(math.ceil((denormalized_rate_values[0])))
        rc_rate = int(math.ceil((denormalized_rate_values[1])))
        rc_expo = round(float(denormalized_rate_values[2]), 2)
    elif tgtRateType == "quickrates":
        rate = int(math.ceil((denormalized_rate_values[0])))
        rc_rate = round(float(denormalized_rate_values[1]), 2)
        rc_expo = round(float(denormalized_rate_values[2]), 2)
    else:
        rate = round(float(denormalized_rate_values[0]), 2)
        rc_rate = round(float(denormalized_rate_values[1]), 2)
        rc_expo = round(float(denormalized_rate_values[2]), 2)

    y_values_src = generateCurve(srcRateType, src_rate, src_rc_rate, src_rc_expo, 20)
    y_values_pred = generateCurve(tgtRateType, rate, rc_rate, rc_expo, 20)

    fit_values = {
        "srcRateType": srcRateType,
        "src_rate": src_rate,
        "src_rc_rate": src_rc_rate,
        "src_rc_expo": src_rc_expo,
        "tgtRateType": tgtRateType,
        "tgt_rate": rate,
        "tgt_rc_rate": rc_rate,
        "tgt_rc_expo": rc_expo,
        "error": round(mse(y_values_src, y_values_pred), 2),
        # "raw_values": [round(denormalized_rate_values[0], 6), round(denormalized_rate_values[1], 6), round(denormalized_rate_values[2], 6)]
    }

    return fit_values
