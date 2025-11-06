from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

from SentimentClassifier import classify_sentiment, upsample_emotions
from GetGIFs import request_tenor_gifs_and_stickers, filter_tenor_results, choose_gif

app = Flask(__name__)
CORS(app)

FILTER = True
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')


@app.route("/get_gif", methods=["POST"])
def get_gif():
    data = request.get_json()
    user_text = data.get("text", "")

    emotion_prediction = classify_sentiment(user_text)
    emotion_keywords = upsample_emotions(emotion_prediction) # DOESNT HAVE CAT APPENDED
    logging.info(f"Predicted emotion: {emotion_prediction}, Keywords for querying: {emotion_keywords}")
    
    all_results = []
    for keyword in emotion_keywords:
        results = request_tenor_gifs_and_stickers(keyword) # ADDS CAT TO SEARCH QUERY
        all_results.extend(results)

    logging.info(f"Fetched {len(all_results)} Tenor results in total.")

    filtered_results = filter_tenor_results(all_results, emotion_keywords)
    logging.info(f"{len(filtered_results)} remain upon filtering.")

    gif_url, metadata = choose_gif(filtered_results if (FILTER and filtered_results) else all_results)

    if not gif_url:
        gif_url = request.host_url + "static/default_cat.gif"
        metadata = {"content_description": "Default fallback cat gif"}

        if not all_results:
            reason = "Tenor failed to return results on the given query."
        elif FILTER and not filtered_results:
            reason = "Filter removed all results."
        else:
            reason = "Unknown error occurred in fetching results."
        
        logging.info(f"Fallback result triggered: {reason}")
        metadata["fallback"] = reason
    
    return jsonify({"emotion": emotion_prediction, "gif":gif_url, "metadata":metadata})


if __name__ == "__main__":
    app.run(debug=True)