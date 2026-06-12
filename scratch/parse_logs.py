import json
import os

try:
    with open('frontend/logs.json', 'r') as f:
        pass # Not stored there
except:
    pass

# The logs are in the conversation history, but let's just grep the file or write a script
