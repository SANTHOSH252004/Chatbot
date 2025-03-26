from flask import Flask, request, render_template, jsonify, session
import json
import asyncio
import aiohttp

app = Flask(__name__)

# Load the knowledge base from a JSON file
with open("knowledge_base.json", "r", encoding="utf-8") as f:
    knowledge_base = json.load(f)

# Ollama API endpoint for generating responses
OLLAMA_API_URL = "http://localhost:11434/api/generate"

# Cache responses to improve efficiency and reduce API calls
response_cache = {}

# Add secret key for session management
app.secret_key = 'your_secret_key_here'

async def fetch_ollama_response(aiohttp_session, prompt):
    payload = {
        "model": "dolphin3",  # Specifies the model to use for response generation
        "prompt": prompt,
        "stream": False,      # Disables streaming for a single response
    }
    async with aiohttp_session.post(OLLAMA_API_URL, json=payload) as response:
        if response.status == 200:
            data = await response.json()
            return data.get("response", "Sorry, no response generated.")
        else:
            return "Sorry, I couldn't generate a response. Please try again later."

def generate_response(user_query, category=None):
    # Check if the response is already cached
    if user_query in response_cache:
        return response_cache[user_query]
    
    # Handle 'Go Back' command
    if user_query.lower() == "go back":
        return "Going back. Please select an option again."
    
    # If a category is specified, look for matching questions in the knowledge base
    if category and category in knowledge_base:
        for qa in knowledge_base[category]:
            if user_query.lower() in qa["question"].lower():
                return qa["answer"]
    
    # Build the prompt for the AI model
    prompt = f"""
    You are a dental support chatbot specializing in:
    - Braces & Invisalign information
    - Treatment plans
    - Payment & insurance
    - Maintenance & care

    User Query: {user_query}
    Response:
    """
    
    async def get_response():
        async with aiohttp.ClientSession() as aiohttp_session:
            response = await fetch_ollama_response(aiohttp_session, prompt)
            response_cache[user_query] = response  # Cache the response
            return response

    # Run the asynchronous task
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    response = loop.run_until_complete(get_response())
    loop.close()
    
    if "couldn't generate a response" in response:
        return "I'm unable to answer that. Would you like to speak with a live agent?"
    
    return response

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_query = request.form.get("user_query")
    category = request.form.get("category")  # Optional category
    response = generate_response(user_query, category)
    # Always return the default quick replies so that the quick reply buttons remain visible.
    default_quick_replies = ["Product Details", "Treatment Plan", "Payment Detail", "Claim Info"]
    return jsonify({"response": response, "quick_replies": default_quick_replies})

@app.route("/options", methods=["GET"])
def options():
    return jsonify({
        "products": ["Braces", "Invisalign", "Retainers", "Go Back"],
        "categories": ["Product Details", "Treatment Plan", "Payment & Insurance", "Maintenance & Care", "Go Back"]
    })

if __name__ == "__main__":
    app.run(debug=True)
