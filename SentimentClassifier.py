import random
from transformers import pipeline

GIF_BASE = "cat"
MODEL = "j-hartmann/emotion-english-distilroberta-base"


emotion_model = pipeline("text-classification", 
                         model=MODEL, 
                         top_k=None)

# Up-sampling the emotions + adding adjectives for diverse searches
# Based on j-hartmann model classes
emotion_labels_upsampled = {
    "anger": ["angry", "furious", "mad", "annoyed", "irritated", "upset"],
    "disgust": ["gross", "ew", "grossed out", "puke"],
    "fear": ["scared", "worried", "terrified", "anxious"],
    "joy": ["happy", "excited", "joy", "dancing", "woohoo","yay", "yippee", "cute"],
    "neutral": ["neutral", "sleeping", "cool", "alright", "nice", "chill"],
    "sadness": ["sad", "unhappy", "crying", "sobbing", "lonely"],
    "surprise": ["surprised", "shocked", "startled"]
}

def classify_sentiment(text):
    prediction = emotion_model(text)[0]
    prediction = max(prediction, key=lambda x: x['score'])['label']
    return prediction

def upsample_emotions(prediction):
    upsampled = emotion_labels_upsampled.get(prediction, [GIF_BASE])
    upsampled_emotions = [f"{s}" for s in random.sample(upsampled, min(4, len(upsampled)))]
    return upsampled_emotions

