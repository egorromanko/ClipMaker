from flask import Flask, request
import pickle
import numpy as np
import json
from flask import Response

app = Flask(__name__)


@app.route("/")
def index():
    return "Hello New World!"

@app.route('/hello')
def hello():
    return "Hello, World"

@app.route('/predict', methods=['POST'])
def predict():
    actions = request.get_json()
    print("Incoming actions: %s" % actions)
    results = []
    for action in actions:
        result = predict_action(action)
        results.append(result)
        print("Action: %s" % action)
        print("Result: %s" % result)
    return Response(json.dumps(results), mimetype='application/json')

if __name__ == "__main__":
    # Init data here
    app.run(host='0.0.0.0')

