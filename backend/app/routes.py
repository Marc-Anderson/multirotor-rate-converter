from flask import request, jsonify
from app.multirotor_rate_converter.core import *

def init(app):
    @app.route("/api/v1/multirotor-rate-converter", methods=['GET'])
    def fitter():
        try:
            srcRateType = request.args.get("srcRateType", "")[:11]
            tgtRateType = request.args.get("tgtRateType", "")[:11]
            srcRate = round(float(request.args.get("rate", "")),2)
            srcRcRate = round(float(request.args.get("rc_rate", "")),2)
            srcRcExpo = round(float(request.args.get("rc_expo", "")),2)
            result = getFitValues(srcRateType, tgtRateType, srcRate, srcRcRate, srcRcExpo)
            result["request_status"] = "okay"
        except ValueError as error:
            result = {
                "request_status": "failed",
                "errors": error.args
            }
        return json.dumps(result)
