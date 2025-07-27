# test api routes for both versions of the api, could be broken up into separate files if needed
import json
from . import BaseTestCase
from .compare_fit_results import evaluate_fit_methods, is_essentially_less_equal
from .utilities import config_from_test_case, random_rate_fitter_config

from app.multirotor_rate_converter.core import getFitValues

# load the json test cases once
with open("./tests/test_cases-20250411.json", "r") as f:
    test_cases = json.load(f)


class RateConverterTest(BaseTestCase):

    @classmethod
    def setUpClass(cls):
        # set up the test case
        cls.test_sum = 0
        cls.new_sum = 0

    @classmethod
    def tearDownClass(cls):
        # print the test sums
        print(f"\ntest error sum: {cls.test_sum}")
        print(f"new error sum : {cls.new_sum}")
        print(f"difference: {cls.new_sum - cls.test_sum}")
        winner = "test" if cls.new_sum - cls.test_sum >= 0 else "new"
        print(f"winner: {winner}")

        with open("./tests/RESULTS.txt", "a") as f:
            f.write(f"\ntest error sum: {cls.test_sum}")
            f.write(f"\nnew error sum : {cls.new_sum}")
            f.write(f"\ndifference: {cls.new_sum - cls.test_sum}")
            f.write(f"\nwinner: {winner}\n")

    def assertPracticallyLessEqual(self, a, b, msg=None):
        tolerance = 0.5
        min_threshold = 60
        if not is_essentially_less_equal(a, b, tolerance, min_threshold):
            message = f"{a} not less than or equal to {b}"
            self.fail(self._formatMessage(msg, message))

    @classmethod
    def generate_test_method(self, test_case):

        def test(self):

            # normalize the function name
            get_fit_results = getFitValues

            # prepare the parameters for the test case
            params = {
                "srcRateType": test_case["srcRateType"],
                "src_rate": round(float(test_case["src_rate"]), 2),
                "src_rc_rate": round(float(test_case["src_rc_rate"]), 2),
                "src_rc_expo": round(float(test_case["src_rc_expo"]), 2),
                "tgtRateType": test_case["tgtRateType"],
            }

            # run the fit test
            fit_data = get_fit_results(**params)
            fit_data = json.dumps(fit_data)
            fit_data = json.loads(fit_data)

            # prepare an error message if the test fails
            base_msg = f"\nexpect: {test_case}\n"
            msg = f"{base_msg}output: {fit_data}"

            # ensure the input data matches the output data
            self.assertEqual(fit_data["srcRateType"], test_case["srcRateType"], msg=msg)
            self.assertEqual(fit_data["src_rate"], test_case["src_rate"], msg=msg)
            self.assertEqual(fit_data["src_rc_rate"], test_case["src_rc_rate"], msg=msg)
            self.assertEqual(fit_data["src_rc_expo"], test_case["src_rc_expo"], msg=msg)
            self.assertEqual(fit_data["tgtRateType"], test_case["tgtRateType"], msg=msg)

            # if both values have an error value, use that for comparison
            if fit_data.get("error") is not None and test_case.get("error") is not None:
                RateConverterTest.test_sum += float(test_case["error"])
                RateConverterTest.new_sum += float(fit_data["error"])
                msg = msg + f"\nerror: {test_case['error']}/{fit_data['error']}"
                # essentially_equal = is_almost_equal(fit_data["error"], test_case["error"])
                self.assertPracticallyLessEqual(
                    fit_data["error"], test_case["error"], msg=msg
                )

            else:
                # otherwise, check the rate values exactly
                exact_match = all(
                    [
                        fit_data["tgt_rate"] == test_case.get("tgt_rate"),
                        fit_data["tgt_rc_rate"] == test_case.get("tgt_rc_rate"),
                        fit_data["tgt_rc_expo"] == test_case.get("tgt_rc_expo"),
                    ]
                )
                # self.assertTrue(values_equal, msg=msg)
                # self.assertEqual(fit_data["tgt_rate"], test_data["tgt_rate"], msg=msg)
                # self.assertEqual(fit_data["tgt_rc_rate"], test_data["tgt_rc_rate"], msg=msg)
                # self.assertEqual(fit_data["tgt_rc_expo"], test_data["tgt_rc_expo"], msg=msg)

                # self.assertAlmostEqual(fit_data["tgt_rate"], test_data["tgt_rate"], msg=msg, delta=0.02)
                # self.assertAlmostEqual(fit_data["tgt_rc_rate"], test_data["tgt_rc_rate"], msg=msg, delta=0.02)
                # self.assertAlmostEqual(fit_data["tgt_rc_expo"], test_data["tgt_rc_expo"], msg=msg, delta=0.02)

                if not exact_match:

                    # define a specific configuration
                    fit_results = evaluate_fit_methods(test_case, num_eval_points=20)
                    fit_data = fit_results["fit_data"]
                    msg = (
                        f"{base_msg}output: {fit_data}"
                        + str(fit_data[0]["error"])
                        + "/"
                        + str(fit_data[1]["error"])
                    )

                    RateConverterTest.test_sum += float(fit_data[0]["error"])
                    RateConverterTest.new_sum += float(fit_data[1]["error"])
                    self.assertLessEqual(
                        fit_data[1]["error"], fit_data[0]["error"], msg=msg
                    )

        return test


# generate new class tests for each test case
for idx, test_case in enumerate(test_cases):
    method_name = f"test_get_fit_results_{idx}"
    if idx % 5000 == 0:
        test_case = random_rate_fitter_config()
    else:
        test_case = config_from_test_case(test_case)
    test_method = RateConverterTest.generate_test_method(test_case)
    setattr(RateConverterTest, method_name, test_method)
