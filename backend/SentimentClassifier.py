import random
from transformers import pipeline
import logging
import requests

import os
from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')

GIF_BASE = "cat"
MODEL = "j-hartmann/emotion-english-distilroberta-base"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL}"

HF_TOKEN = os.getenv("HF_KEY")

## Previous -- model loaded in
# emotion_model = pipeline("text-classification", model=MODEL, top_k=None)

# Up-sampling the emotions + adding adjectives for diverse searches
# Based on j-hartmann model classes
emotion_labels_upsampled = {
    "anger": ["angry", "furious", "mad", "annoyed", "irritated", "upset", "fighting", "punch"],
    "disgust": ["gross", "ew", "grossed out", "puke"],
    "fear": ["scared", "worried", "terrified", "anxious"],
    "joy": ["happy", "excited", "smiling", "smile", "jumping", "hug", "joy", "dancing", "woohoo","yay", "yippee", "cute"],
    "neutral": ["neutral", "", "funny", "sleeping", "cool", "alright", "nice", "chill"],
    "sadness": ["sad", "unhappy", "crying", "sobbing", "lonely"],
    "surprise": ["surprised", "shocked", "gasp", "flabbergasted", "startled"]
}

def classify_sentiment(text):
    if not HF_TOKEN:
        logging.warning("HF_TOKEN not set, using fallback emotion detection")
        return classify_sentiment_backup(text)
    
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    try:
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json={"inputs": text},
            timeout=10
        )
        # print(response)
        if response.status_code ==200:
            results = response.json()
            if isinstance(results, list) and len(results) > 0:
                if isinstance(results[0], list):
                    predictions = results[0]
                else:
                    predictions = results
                
                # print(predictions)
                best_prediction = max(predictions, key=lambda x: x['score'])
                return best_prediction['label']
    except Exception as e:
        logging.error(f"Error calling HF API: {e}, using fallback")
        return classify_sentiment_backup(text)
    

    ## Previous -- model loaded in
    # prediction = emotion_model(text)[0]
    # prediction = max(prediction, key=lambda x: x['score'])['label']
    # return prediction

def classify_sentiment_backup(text):
    """Simple keyword-based fallback if API fails"""
    text_lower = text.lower()
    
    # Simple keyword matching
    if any(word in text_lower for word in ["happy", "joy", "excited", "great", "awesome", "love"]):
        return "joy"
    elif any(word in text_lower for word in ["sad", "unhappy", "depressed", "crying", "miserable"]):
        return "sadness"
    elif any(word in text_lower for word in ["angry", "mad", "furious", "annoyed", "hate"]):
        return "anger"
    elif any(word in text_lower for word in ["scared", "afraid", "worried", "anxious", "terrified"]):
        return "fear"
    elif any(word in text_lower for word in ["disgusted", "gross", "eww", "yuck"]):
        return "disgust"
    elif any(word in text_lower for word in ["surprised", "shocked", "wow", "omg"]):
        return "surprise"
    else:
        return "neutral"

def upsample_emotions(prediction):
    upsampled = emotion_labels_upsampled.get(prediction, [GIF_BASE])
    upsampled_emotions = [f"{s}" for s in random.sample(upsampled, min(4, len(upsampled)))]
    return upsampled_emotions

