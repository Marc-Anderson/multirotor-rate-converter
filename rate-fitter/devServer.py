from flask import Flask, request, jsonify
app = Flask(__name__,
            static_url_path='', 
            static_folder='../public')

from server import fitter
from rateFitter import *

@app.route('/')
def public():
    return app.send_static_file('index.html')

@app.route("/api", methods=['GET'])
def server():
    return fitter()

if __name__ == "__main__":
    app.run(host='localhost', port=3000, debug=True)