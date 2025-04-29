from flask import Flask, request, jsonify, render_template_string, redirect, url_for
from datetime import datetime
import threading
import os
import firebase_admin
from firebase_admin import credentials, firestore
import json
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Initialize Firebase Admin SDK with credentials
# Check if running on Render (production) or locally
if os.environ.get('RENDER'):
    # In production, try to load from secrets file first
    try:
        # Path to secrets file in Render
        secrets_path = '/etc/secrets/firebase_credentials.json'
        if os.path.exists(secrets_path):
            print("Loading Firebase credentials from Render secrets file")
            cred = credentials.Certificate(secrets_path)
        else:
            # Fallback to environment variable if secrets file doesn't exist
            firebase_creds_json = os.environ.get('FIREBASE_CREDENTIALS')
            if firebase_creds_json:
                # Parse the JSON string
                cred_dict = json.loads(firebase_creds_json)
                cred = credentials.Certificate(cred_dict)
            else:
                raise ValueError("Neither secrets file nor FIREBASE_CREDENTIALS environment variable found")
    except Exception as e:
        print(f"Error loading Firebase credentials in production: {e}")
        # Don't fallback to file-based credentials in production for security
        raise
else:
    # Local development - prefer environment variable even in development
    try:
        # Try to get from environment variable first
        firebase_creds_json = os.environ.get('FIREBASE_CREDENTIALS')
        if firebase_creds_json:
            # Parse the JSON string
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
        else:
            # Fall back to file if environment variable not set
            cred_path = os.path.join(os.path.dirname(__file__), 'esp32', 'my-project-6c692-4b9dc109b42c.json')
            if not os.path.exists(cred_path):
                raise FileNotFoundError(f"Firebase credentials file not found: {cred_path}")
            
            print("WARNING: Using file-based Firebase credentials. For better security, set FIREBASE_CREDENTIALS environment variable.")
            cred = credentials.Certificate(cred_path)
    except Exception as e:
        print(f"Error loading Firebase credentials: {e}")
        raise

firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

CURRENT_MSG = "hello, world!"
UPDATED_AT = datetime.utcnow()
FIRESTORE_DATA = {}
LAST_FIRESTORE_UPDATE = datetime.utcnow()
COLLECTION_NAME = "shuttles"  # Collection name from your Firestore database
DOCUMENT_ID = "bus1"  # Document ID from your Firestore database
firestore_listener_active = False

# Function to format Firestore data into a readable message
def format_firestore_data(data):
    if not data:
        return None
    
    # Extract only the occupancy data as shown in your screenshot
    if 'occupancy' in data:
        occupancy = data['occupancy']
        formatted_msg = f"Bus Occupancy: {occupancy}"
        return formatted_msg[:32]  # Truncate to 32 chars to fit LCD display
    
    return None

# Callback function for Firestore document changes
def on_snapshot(doc_snapshot, changes, read_time):
    global FIRESTORE_DATA, LAST_FIRESTORE_UPDATE, CURRENT_MSG, UPDATED_AT
    
    for doc in doc_snapshot:
        print(f"Received document snapshot: {doc.id}")
        FIRESTORE_DATA = doc.to_dict()
        LAST_FIRESTORE_UPDATE = datetime.utcnow()
        
        # Format Firestore data into a readable message for LCD
        formatted_data = format_firestore_data(FIRESTORE_DATA)
        if formatted_data:
            CURRENT_MSG = formatted_data
            UPDATED_AT = LAST_FIRESTORE_UPDATE
            print(f"Updated message to: {CURRENT_MSG}")

# Setup Firestore real-time listener
def setup_firestore_listener():
    global firestore_listener_active
    if firestore_listener_active:
        return
        
    try:
        # Listen specifically to the bus1 document in the shuttles collection
        doc_ref = db.collection(COLLECTION_NAME).document(DOCUMENT_ID)
        
        # Setup a real-time listener
        doc_watch = doc_ref.on_snapshot(on_snapshot)
        
        firestore_listener_active = True
        print(f"Firestore real-time listener setup for {COLLECTION_NAME}/{DOCUMENT_ID}")
        
        # Fetch initial data
        doc = doc_ref.get()
        if (doc.exists):
            FIRESTORE_DATA = doc.to_dict()
            LAST_FIRESTORE_UPDATE = datetime.utcnow()
            
            # Format Firestore data into a readable message
            formatted_data = format_firestore_data(FIRESTORE_DATA)
            if formatted_data:
                CURRENT_MSG = formatted_data
                UPDATED_AT = LAST_FIRESTORE_UPDATE
    except Exception as e:
        print(f"Error setting up Firestore listener: {e}")
        firestore_listener_active = False

# Start the Firestore listener in a separate thread
def start_firestore_listener():
    listener_thread = threading.Thread(target=setup_firestore_listener, daemon=True)
    listener_thread.start()

# Start the Firestore listener when the app starts
start_firestore_listener()

HTML_PAGE = """<!doctype html><html><head><meta charset='utf-8'>
<title>ESP32 LCD</title></head>
<body style='font-family:sans-serif;text-align:center;margin-top:40px;'>
  <h2>Update LCD Text</h2>
  <form action='{{ url_for("set_message") }}' method='post'>
    <input name='text' maxlength='32' style='width:200px;font-size:1.2em;'>
    <button type='submit' style='font-size:1.2em;'>Send</button>
  </form>
  <p>Current message: <b>{{ current }}</b><br>Updated: {{ updated }}</p>
  <hr>
  <h3>Latest Firestore Data</h3>
  <p>{{ firestore_data }}</p>
  <p>Last Firestore update: {{ firestore_updated }}</p>
</body></html>"""

@app.route("/")
def home():
    return redirect(url_for("dashboard"))

@app.route("/dashboard")
def dashboard():
    return render_template_string(HTML_PAGE, 
                                 current=CURRENT_MSG,
                                 updated=UPDATED_AT.strftime("%Y-%m-%d %H:%M:%S UTC"),
                                 firestore_data=FIRESTORE_DATA,
                                 firestore_updated=LAST_FIRESTORE_UPDATE.strftime("%Y-%m-%d %H:%M:%S UTC"))

@app.route("/set", methods=["POST"])
def set_message():
    global CURRENT_MSG, UPDATED_AT
    CURRENT_MSG = request.form.get("text", CURRENT_MSG)[:32]
    UPDATED_AT = datetime.utcnow()
    return redirect(url_for("dashboard"))

@app.route("/message", methods=["GET", "POST"])
def api_message():
    """JSON API used by ESP32 (GET) and programmable clients (POST)."""
    global CURRENT_MSG, UPDATED_AT
    
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        CURRENT_MSG = data.get("text", CURRENT_MSG)[:32]
        UPDATED_AT = datetime.utcnow()
        return jsonify(status="ok", text=CURRENT_MSG, updated=UPDATED_AT.isoformat())
    
    # Return the current message with bus occupancy data
    return jsonify(
        text=CURRENT_MSG,
        updated=UPDATED_AT.isoformat()
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)