"""Check HTTP API responses without starting a server."""

import unittest

from app import create_app
from multirotor_rate_converter.core import getFitValues


API_PATH = "/api/v1/multirotor-rate-converter"
VALID_INPUT = {
    "srcRateType": "betaflight",
    "tgtRateType": "raceflight",
    "rate": "0.7",
    "rc_rate": "1",
    "rc_expo": "0.5",
}


class BackendTest(unittest.TestCase):
    def setUp(self):
        app = create_app()
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_conversion_matches_backend(self):
        response = self.client.get(API_PATH, query_string=VALID_INPUT)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.is_json)
        expected = getFitValues("betaflight", "raceflight", 0.7, 1, 0.5)
        self.assertEqual(response.get_json(), dict(expected, request_status="okay"))

    def test_missing_parameters_return_json_error(self):
        for missing in VALID_INPUT:
            with self.subTest(missing=missing):
                params = {key: value for key, value in VALID_INPUT.items() if key != missing}
                response = self.client.get(API_PATH, query_string=params)
                self.assert_api_error(response)

    def test_invalid_parameters_return_json_error(self):
        invalid_inputs = [
            {"rate": "not-a-number"},
            {"srcRateType": "unsupported"},
            {"tgtRateType": "unsupported"},
            {"rate": "-1"},
            {"rate": "100"},
            {"rc_rate": "-1"},
            {"rc_expo": "2"},
        ]
        for invalid in invalid_inputs:
            with self.subTest(invalid=invalid):
                response = self.client.get(API_PATH, query_string=dict(VALID_INPUT, **invalid))
                self.assert_api_error(response)

    def assert_api_error(self, response):
        self.assertEqual(response.status_code, 400)
        self.assertTrue(response.is_json)
        result = response.get_json()
        self.assertEqual(result["request_status"], "failed")
        self.assertIsInstance(result["errors"], list)
        self.assertTrue(result["errors"])

    def test_post_is_not_supported(self):
        self.assertEqual(self.client.post(API_PATH, data=VALID_INPUT).status_code, 405)
