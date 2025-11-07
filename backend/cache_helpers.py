import time
import random

TENOR_CACHE = {}
CACHE_TTL = 300

# Retrieve from cache if TTL hasn't expired
def get_cached_results(emotion):
    entry = TENOR_CACHE.get(emotion)

    if entry:
        results, timestamp = entry
        if time.time() - timestamp < CACHE_TTL:
            return results
        
        else:
            del TENOR_CACHE[emotion]
    
    return None

# Add to cache
def store_to_cache(emotion, results):
    TENOR_CACHE[emotion] = (results, time.time())
