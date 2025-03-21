
#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
import g4f
import json
import os
import sys

app = Flask(__name__)
CORS(app)

# Use simpler storage mechanism for memory
MEMORY_FILE = "conversation_memory.json"

def save_memory(memory):
    try:
        with open(MEMORY_FILE, "w") as f:
            json.dump(memory, f)
    except Exception as e:
        print(f"Error saving memory: {e}")

def load_memory():
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading memory: {e}")
    return {}

memory = load_memory()

@app.route("/api/generate", methods=["POST"])
def generate():
    try:
        data = request.json
        prompt = data.get("prompt", "")
        session_id = data.get("sessionId", "default")
        
        # Initialize session if it doesn't exist
        if session_id not in memory:
            memory[session_id] = []
        
        # Add user message to memory
        memory[session_id].append({"role": "user", "content": prompt})
        
        # Generate response using g4f
        messages = memory[session_id]
        response = g4f.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            stream=False
        )
        
        # Add response to memory
        memory[session_id].append({"role": "assistant", "content": response})
        
        # Save updated memory
        save_memory(memory)
        
        return jsonify({"response": response})
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500

@app.route("/api/clear", methods=["POST"])
def clear_memory():
    try:
        data = request.json
        session_id = data.get("sessionId", "default")
        
        if session_id in memory:
            memory[session_id] = []
            save_memory(memory)
        
        return jsonify({"status": "Memory cleared"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Use a port that's likely to be available on Termux
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
