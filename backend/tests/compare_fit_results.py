# pip3 install requests

# run this script with `python3 -m eval.compare_fit_results`

import requests
import time
import math

# from tests.utils_rate_fitter_test_helpers import random_rate_fitter_config
from app.multirotor_rate_converter.core import (
    getDegreesPerSecondAtRcCommand,
    getFitValues,
    mse,
)
from tests.utilities import linspace


def time_get_fit_results(get_fit_results_fn):
    def wrapper(*args, **kwargs):
        start_time = time.time()

        # call the function
        response_dict = get_fit_results_fn(*args, **kwargs)

        end_time = time.time()
        time_taken = end_time - start_time

        response_dict["time_taken"] = round(float(time_taken), 2)
        return response_dict

    return wrapper


class RateValues:
    def __init__(self, rate, rc_rate, rc_expo):
        self.rate = rate
        self.rc_rate = rc_rate
        self.rc_expo = rc_expo


class RateFitterConfig:
    def __init__(
        self, source_firmware, target_firmware, source_rate_values: RateValues
    ):
        self.srcRateType = source_firmware
        self.src_rate = source_rate_values.rate
        self.src_rc_rate = source_rate_values.rc_rate
        self.src_rc_expo = source_rate_values.rc_expo
        self.tgtRateType = target_firmware


class EvaluationMethod:
    def __init__(self, name):
        self.name = (
            name.strip().replace(" ", "_").replace("-", "_").replace(".", "_").lower()
        )

    def get_fit_results(self, rate_fitter_input):
        raise NotImplementedError("This method should be overridden by subclasses")


class ApiEvaluationMethod(EvaluationMethod):
    def __init__(self, name, endpoint=0):
        super().__init__(name)
        if not isinstance(endpoint, str):
            endpoints = [
                "https://rates.metamarc.com/api/v1/multirotor-rate-converter",
                "http://127.0.0.1:5000/api/v1/multirotor-rate-converter",
            ]
            if endpoint > len(endpoints) - 1:
                raise ValueError(f"endpoint must be between 0 and {len(endpoints) - 1}")
            endpoint = endpoints[endpoint]

        self.endpoint = endpoint

    @time_get_fit_results
    def get_fit_results(self, rate_fitter_input):
        key_map = {
            "src_rate": "rate",
            "src_rc_rate": "rc_rate",
            "src_rc_expo": "rc_expo",
        }
        rate_fitter_input = {
            key_map.get(key, key): value for key, value in rate_fitter_input.items()
        }
        response = requests.get(self.endpoint, params=rate_fitter_input)
        response_dict = response.json()
        return response_dict


class ModuleEvaluationMethod(EvaluationMethod):
    def __init__(self, name, get_fit_values_fn=None):
        super().__init__(name)
        self.get_fit_values_fn = get_fit_values_fn
        if get_fit_values_fn is None:
            self.get_fit_values_fn = getFitValues

    @time_get_fit_results
    def get_fit_results(self, rate_fitter_input):
        key_map = {
            "rate": "src_rate",
            "rc_rate": "src_rc_rate",
            "rc_expo": "src_rc_expo",
        }
        rate_fitter_input = {
            key_map.get(key, key): value for key, value in rate_fitter_input.items()
        }
        response_dict = self.get_fit_values_fn(**rate_fitter_input)
        return response_dict


# tolerance 50% and min threshold 60
def is_almost_equal(a, b, tolerance=0.5, min_threshold=60):
    a = math.floor(a)
    b = math.floor(b)
    abs_diff = abs(a - b)
    avg_magnitude = (abs(a) + abs(b)) / 2
    # if both values are less than the threshold, we can consider them equal
    if max(a, b) < min_threshold:
        return True

    return abs_diff <= avg_magnitude * tolerance


def is_essentially_less_equal(a, b, tolerance=0.5, min_threshold=60):
    return any([is_almost_equal(a, b, tolerance, min_threshold), a <= b])


# test multiple fit methods against one another
def evaluate_fit_methods(
    rate_fitter_config: RateFitterConfig,
    evaluation_methods: list[EvaluationMethod] = None,
    num_eval_points=20,
):
    if evaluation_methods is None:
        evaluation_methods = [
            ApiEvaluationMethod(name="server"),
            ModuleEvaluationMethod(name="local"),
        ]
    # generate x values between 0 and 1
    x_axis_values = linspace(0, 1, num_eval_points)

    # get random values to fit
    srcRateType = rate_fitter_config.get("srcRateType")
    rate = rate_fitter_config.get("src_rate")
    rc_rate = rate_fitter_config.get("src_rc_rate")
    rc_expo = rate_fitter_config.get("src_rc_expo")
    tgtRateType = rate_fitter_config.get("tgtRateType")
    #
    rate_fitter_input = {
        "srcRateType": srcRateType,
        "src_rate": rate,
        "src_rc_rate": rc_rate,
        "src_rc_expo": rc_expo,
        "tgtRateType": tgtRateType,
    }

    # define the source values which we want to fit to
    y_source_values = [
        getDegreesPerSecondAtRcCommand(srcRateType, rcPoint, rate, rc_rate, rc_expo)
        for rcPoint in x_axis_values
    ]

    eval_results = {
        **rate_fitter_input,
        "winner": "-----",
        "fit_points": int(num_eval_points),
        "fit_data": [],
    }

    for eval_method in evaluation_methods:
        # get the results from the local api
        fit_result = eval_method.get_fit_results(rate_fitter_input)
        # generate a curve using predicted local rate values
        y_pred_values = [
            getDegreesPerSecondAtRcCommand(
                tgtRateType,
                rcPoint,
                fit_result["tgt_rate"],
                fit_result["tgt_rc_rate"],
                fit_result["tgt_rc_expo"],
            )
            for rcPoint in x_axis_values
        ]
        # calculate the mean squared error of the results
        fit_error = round(float(mse(y_source_values, y_pred_values)), 2)
        eval_results["fit_data"].append(
            {
                "name": eval_method.name,
                f"tgt_rate": fit_result["tgt_rate"],
                f"tgt_rc_rate": fit_result["tgt_rc_rate"],
                f"tgt_rc_expo": fit_result["tgt_rc_expo"],
                f"error": fit_error,
                f"time_taken": fit_result["time_taken"],
                "y_pred_values": y_pred_values,
            }
        )

    # compare the error of the results
    fit_data = eval_results["fit_data"]
    min_error = float("inf")

    for fit_result in fit_data:
        current_error = fit_result["error"]
        if current_error < min_error:
            min_error = current_error
            winner = fit_result["name"]

    # check if all errors are almost equal
    errors = [fit_result["error"] for fit_result in fit_data]
    if all(is_almost_equal(errors[0], error) for error in errors[1:]):
        winner = "-----"
    eval_results["winner"] = winner

    return eval_results


# if __name__ == "__main__":
#     # get the current date and time
#     now = datetime.datetime.now()
#     # format the date and time as a string
#     date_str = now.strftime("%Y-%m-%d_%H-%M-%S")

#     # create a directory with the current date and time
#     os.makedirs(f"results/{date_str}", exist_ok=True)

#     # read the test cases from the csv file
#     with open("tests/rate_fitter_test_cases.csv", "r") as csv_file:
#         reader = csv.DictReader(csv_file)
#         test_cases = list(reader)

#     for test_case in test_cases:
#         rate_fitter_config = config_from_test_case(test_case)
#         eval_results = evaluate_fit_methods(rate_fitter_config)
#         # save the results to a json file
#         with open(
#             f"results/{date_str}/{rate_fitter_config['source_firmware']}_{rate_fitter_config['target_firmware']}.json",
#             "w",
#         ) as json_file:
#             json.dump(eval_results, json_file, indent=4)
