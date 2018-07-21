from flask import Flask, request
import pickle
import numpy as np
import json
from flask import Response
import json

app = Flask(__name__)


@app.route("/")
def index():
    return "Hello New World!"

@app.route('/hello')
def hello():
    return "Hello, World"

@app.route('/analyze', methods=['POST'])
def predict():
    return Response(json.dumps({"code": "200"}), mimetype='application/json')

if __name__ == "__main__":
    # Init data here
    app.run(host='0.0.0.0')

