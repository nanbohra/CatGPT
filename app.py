from flask import Flask, request, jsonify
from flask_cors import CORS

from SentimentClassifier import classify_sentiment, upsample_emotions
from GetGIFs import request_tenor_gifs, filter_tenor_results, choose_gif

app = Flask(__name__)
CORS(app)

FILTER = True


@app.route("/get_gif", methods=["POST"])
def get_gif():
    data = request.get_json()
    user_text = data.get("text", "")

    emotion_prediction = classify_sentiment(user_text)
    emotion_keywords = upsample_emotions(emotion_prediction) # DOESNT HAVE CAT APPENDED
    print(emotion_keywords)
    
    all_results = []
    for keyword in emotion_keywords:
        results = request_tenor_gifs(keyword) # ADDS CAT TO SEARCH QUERY
        all_results.extend(results)

    filtered_results = filter_tenor_results(all_results, emotion_keywords)

    gif_url, metadata = choose_gif(filtered_results if (FILTER and filtered_results) else all_results)
    
    return jsonify({"emotion": emotion_prediction, "gif":gif_url, "metadata":metadata})


if __name__ == "__main__":
    app.run(debug=True)