import os
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from PIL import Image
import traceback
from dotenv import load_dotenv

# Build the absolute path to the .env file and load it
script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(script_dir, '.env')
load_dotenv(dotenv_path=dotenv_path)

# Configure the Gemini API key from environment variable
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    # This print statement is for debugging purposes on the server
    print("Error: GEMINI_API_KEY environment variable not set.")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Build the absolute path to the prompt.txt file
prompt_path = os.path.join(script_dir, 'prompt.txt')

# Load the prompt from the file
with open(prompt_path, 'r') as f:
    prompt_text = f.read()

# Get the built frontend directory path
frontend_dist_path = os.path.join(os.path.dirname(script_dir), 'frontend', 'dist')

app = Flask(__name__, static_folder=frontend_dist_path, static_url_path='')
CORS(app)  # Allow cross-origin requests

@app.after_request
def add_cors_headers(response):
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
    return response

# API Routes (these must come before the catch-all route)
@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Check if API key is configured on the server
    if not GEMINI_API_KEY:
        return jsonify({'error': 'Gemini API key is not configured on the server.'}), 500
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        img = Image.open(file.stream)
        
        response = model.generate_content([prompt_text, img])
        
        return jsonify({'analysis': response.text})
    except Exception as e:
        print("An error occurred during analysis:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Backward compatibility route
@app.route('/analyze', methods=['POST'])
def analyze_image_legacy():
    return analyze_image()

# Serve the React app
@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

# Handle React Router routes (this must come after API routes)
@app.route('/<path:path>')
def serve_react_routes(path):
    # For static files (CSS, JS, images), serve them directly
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    
    # For any other route, serve the React app (for client-side routing)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Get port from environment variable (Railway) or default to 5000 (local development)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 