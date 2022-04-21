from flask import Flask, request, jsonify
app = Flask(__name__)

from rateFitter import *

@app.route("/api", methods=['GET'])
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

if __name__ == "__main__":
    app.run(host='0.0.0.0')