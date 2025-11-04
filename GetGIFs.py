import requests
import random
from transformers import pipeline

from SentimentClassifier import upsample_emotions

import os
from dotenv import load_dotenv
load_dotenv()

GIF_BASE = "cat"
GIF_BASE_SYN = {"cat", "kitty", "kitten"}
AVOID_WORDS = {"kiss", "dog", "puppy", "baby", "human", "person"}
GIF_LIMIT = 10
TENOR_KEY = os.getenv("TENOR_KEY")

def request_tenor_gifs_and_stickers(emotion, limit=10):
    tenor_key = TENOR_KEY
    results = []

    gif_url = f"https://tenor.googleapis.com/v2/search?q={emotion} {GIF_BASE}&key={tenor_key}&limit={limit}&contentfilter=medium&media_filter=minimal"
    try:
        r = requests.get(gif_url, timeout=5)
        r.raise_for_status()
        results.extend(r.json().get("results", []))
    except requests.exceptions.RequestException as e:
        print(f"Error fetching GIFs for {emotion}: {e}")

    sticker_url = f"https://tenor.googleapis.com/v2/search?q={emotion} {GIF_BASE}&key={tenor_key}&limit={limit}&searchfilter=sticker,-static&contentfilter=medium&media_filter=minimal"
    try:
        r = requests.get(sticker_url, timeout=5)
        r.raise_for_status()
        results.extend(r.json().get("results", []))
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Stickers for {emotion}: {e}")

    return results


def request_tenor_gifs(emotion, limit=15):
    tenor_key = TENOR_KEY
    search_terms = [f"{emotion}" + GIF_BASE]

    results = []

    for term in search_terms:
        gif_url = f"https://tenor.googleapis.com/v2/search?q={term}&key={tenor_key}&limit={limit}&contentfilter=medium&media_filter=minimal"
        try:
            r = requests.get(gif_url, timeout=5)
            r.raise_for_status()
            r = r.json()
            results.extend(r.get("results", []))
        except requests.exceptions.RequestException as e:
            print(f"Error fetching GIFs for {term}: {e}")
            continue


        sticker_url = f"https://tenor.googleapis.com/v2/search?q={term}&key={tenor_key}&limit={limit}&searchfilter=sticker&contentfilter=medium&media_filter=minimal"
        try:
            r = requests.get(sticker_url, timeout=5)
            r.raise_for_status()
            r = r.json()
            # print(r)
            results.extend(r.get("results", []))
        except requests.exceptions.RequestException as e:
            print(f"Error fetching Stickers for {term}: {e}")
            continue

        # results += [r['media_formats']['gif']['url'] for r in res['results']]
    return results


def filter_tenor_results(results, emotion_keywords):
    filtered = []
    allowed_base_synonyms = GIF_BASE_SYN
    banned = AVOID_WORDS

    for r in results:
        desc = r.get("content_description", "").lower()
        tags = [t.lower() for t in r.get("tags", [])]

        is_cat = any(cat in tags or cat in desc for cat in allowed_base_synonyms)
        matches_emotion = any(e in desc or e in tags for e in emotion_keywords)

        has_banned = any(b in desc or b in tags for b in banned)

        if is_cat and matches_emotion and not has_banned:
            filtered.append(r)

    return filtered

def choose_gif(responses):
    if not responses:
        return None, None

    chosen = random.choice(responses)
    url = None
    if "media_formats" in chosen:
        if "gif" in chosen["media_formats"]:
            url = chosen["media_formats"]["gif"]["url"]
        elif "mp4" in chosen["media_formats"]:
            url = chosen["media_formats"]["mp4"]["url"]
        else:
            url = next(iter(chosen["media_formats"].values()))["url"]

    # Collect metadata for inspection
    metadata = {
        "id": chosen.get("id"),
        "tags": chosen.get("tags", []),
        "content_description": chosen.get("content_description", ""),
        "url": url
    }

    return url, metadata

def find_gif(query):
    result = request_tenor_gifs(query)
    emotion_kywds = upsample_emotions(result)
    filtered_results = filter_tenor_results(result, emotion_kywds) # filter WIP
    gif = choose_gif(filtered_results)
    return gif

