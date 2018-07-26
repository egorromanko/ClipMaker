from __future__ import unicode_literals
# -*- coding: utf-8 -*-
from flask import Flask, request

import pickle
import numpy as np
import json
from flask import Response
from flask import send_file
import json
from langdetect import detect
import nltk
from pyAudioAnalysis import audioSegmentation as aS

import librosa 
import IPython.display as ipd 
import matplotlib.pyplot as plt
import librosa.display
import numpy as np
import youtube_dl

app = Flask(__name__)
lastDownloadedFileName = ''

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
    print(downcased)
    return downcased

@app.route('/beat', methods=['GET'])
def detectBeat():
    url = request.args.get('url', default = "*", type = str)
    count = request.args.get('count', default = "1", type = int)
    print(url)
    filenameId = url[url.rfind('?v=') + 3:]
    y, sr = librosa.load(r"AI/mp3/" + filenameId + '.mp3')
    onset_env = librosa.onset.onset_strength(y, sr=sr,
    aggregate=np.median)
    tempo, beat_times = librosa.beat.beat_track(onset_envelope=onset_env,
    sr=sr,
    start_bpm=60, units='time')
    all_beats = beat_times.tolist()
    print(all_beats[0])
    print(all_beats[-1])

    first_beat = all_beats[0] + 3
    last_beat = all_beats[-1] - 5

    delta = (last_beat - first_beat) / (count - 1)
    final_image_ts = []
    final_image_ts.append(first_beat)
    last_beat_in_cycle = first_beat

    for time in all_beats:
        #print(abs((last_beat_in_cycle + delta) - time))
        if abs((last_beat_in_cycle + delta) - time) < 0.5 :
            final_image_ts.append(time)
            last_beat_in_cycle = time

    return Response(json.dumps({"beats":final_image_ts}), mimetype='application/json') 

def download(url):
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': r'AI/mp3/%(id)s.%(ext)s',
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        result = ydl.extract_info("{}".format(url))
        filename = ydl.prepare_filename(result)
        return filename[:filename.rfind('.')] + '.mp3'
    return "empty"

@app.route('/download', methods=['GET'])
def downloadTrack():
    url = request.args.get('url', default = "*", type = str)
    filename = download(url)
    return send_file(r"../" + filename.encode('utf-8'))

if __name__ == "__main__":
    # Init data here
    app.run(host='0.0.0.0')

