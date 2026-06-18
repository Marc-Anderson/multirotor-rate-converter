# utilities for testing
import random
import json


# load the config file containing all of the rate data
with open("./tests/resources/fc_firmware_constants.json", "r") as file:
    fc_firmware_constants = json.load(file)


# load the config file containing all of the rate data
with open("./tests/test_cases-20250411.json", "r") as file:
    rate_fitter_test_cases = json.load(file)


# class RateFitterConfig:
#     srcRateType
#     src_rate
#     src_rc_rate
#     src_rc_expo
#     tgtRateType


def config_from_test_case(test_case):

    rate_fitter_config = test_case["data"]

    return rate_fitter_config


def random_rate_test_case_config():

    test_case = random.choice(rate_fitter_test_cases)

    return config_from_test_case(test_case)


def linspace(start, stop, num_points=50):
    """
    Generate a list of evenly spaced values between start and stop.

    :param start: The starting value.
    :param stop: The ending value.
    :param num_points: The number of points to generate.
    :return: A list of evenly spaced values.
    """
    if num_points < 2:
        return [start]

    step = (stop - start) / (num_points - 1)
    return [start + step * i for i in range(num_points)]


def random_rate_fitter_config():
    """
    Returns:
        dictionary which represents a test with two different firmware versions(source and target) and randomly generated rate values for the source firmware.

        Example:
            {'srcRateType': 'betaflight', 'src_rate': 0.39, 'src_rc_rate': 2.03, 'src_rc_expo': 0.64, 'tgtRateType': 'kiss'}
    """
    config_obj = generate_random_rate_fitter_config(fc_firmware_constants)
    return config_obj


def generate_random_rate_fitter_config(source_data):
    """
    Generates a random test configuration where each rc_rate, rate, and rc_expo is a random value
    between its min and max.

    Args:
    source_data: A dictionary containing rate data for different firmware versions.

    Returns:
        dictionary which represents a test with two different firmware versions(source and target) and randomly generated rate values for the source firmware.

        Example:
            {'srcRateType': 'betaflight', 'src_rate': 0.39, 'src_rc_rate': 2.03, 'src_rc_expo': 0.64, 'tgtRateType': 'kiss'}
    """
    firmware_ids = list(source_data.keys())

    source_firmware = random.choice(firmware_ids)
    target_firmware = random.choice(firmware_ids)

    while target_firmware == source_firmware:
        target_firmware = random.choice(firmware_ids)

    config_obj = {
        "srcRateType": source_firmware,
        "src_rate": 0.7,
        "src_rc_rate": 1,
        "src_rc_expo": 0,
        "tgtRateType": target_firmware,
    }

    for rate_type in source_data[source_firmware]["rateValues"]:
        min_val = source_data[source_firmware]["rateValues"][rate_type]["min"]
        max_val = source_data[source_firmware]["rateValues"][rate_type]["max"]
        step = source_data[source_firmware]["rateValues"][rate_type]["step"]

        # Generate random values with specified step
        rate_value = round(
            random.randrange(int(min_val / step), int(max_val / step) + 1) * step, 2
        )

        config_obj[f"src_{rate_type}"] = rate_value

    return config_obj


# for i in range(10):
#     random_rate_config = random_rate_fitter_config()
#     print("random_rate_config: ", random_rate_config)

# for i in range(10):
#     random_test_config = random_rate_test_case_config()
#     print("random_test_config: ", random_test_config)
