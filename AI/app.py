# -*- coding: utf-8 -*-
from flask import Flask, request
import pickle
import numpy as np
import json
from flask import Response
import json
from langdetect import detect
import nltk

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

@app.route('/summary', methods=['POST'])
def getSummary():
    body = request.get_json()
    #text = u"""Забирай меня скорей, увози за сто морей. И целуй меня везде, 18 мне уже. Забирай меня скорей, увози за сто морей. И целуй меня везде, я ведь взрослая уже"""
    #text = u"""So close, no matter how far. Couldn't be much more from the heart. Forever trusting who we are. And nothing else matters. Never opened myself this way. Life is ours, we live it our way. All these words I don't just say. And nothing else matters"""
    text = body['text']
   
    joined = tagText(text)
    return Response(json.dumps(joined), mimetype='application/json')

def tagText(text):
    text = text.lower()
    langTag = detect(text)
    isRussian = False
    isEnglish = False
    if langTag == 'ru':
        isRussian = True
        targetPos = 'S' #существительное
        print 'Russian'
    elif langTag == 'en':
        isEnglish = False
        targetPos = 'NN' #noun
        print 'English'
    else:
        print langTag

    tokens = nltk.word_tokenize(text)
    tagged = nltk.pos_tag(tokens, lang='rus') if isRussian else nltk.pos_tag(tokens)
    nouns = [word for word, pos in tagged
            if (pos == targetPos)]
    downcased = [x.encode('utf-8').lower() for x in nouns]
    joined = " ".join(downcased).encode('utf-8')
    return downcased

if __name__ == "__main__":
    # Init data here
    app.run(host='0.0.0.0')

