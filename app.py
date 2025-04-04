import json
from flask import Flask, render_template, request, jsonify  
from services.real_time_scoring import process_real_time_scoring 
from services.kafka_consumer import start_kafka_consumer
import os
import pandas as pd
from socketio_instance import socketio
from services.BERTScore import analyze_email
from services.Knowledgebase import get_knowledge_base_score
from services.Similarity import find_similar_emails

app = Flask(__name__)  
socketio.init_app(app)

# Start Kafka Consumer when Flask starts
start_kafka_consumer()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on("upload_csv")
def handle_csv_upload(data):
    """Handle CSV upload from frontend and send data for real-time scoring."""
    file_content = data["fileContent"]
    file_name = os.path.join(UPLOAD_FOLDER, "uploaded.csv")

    # Save CSV file
    with open(file_name, "w") as f:
        f.write(file_content)

    # Read CSV and extract required columns
    df = pd.read_csv(file_name)
    if not {"user", "date", "activity_encoded"}.issubset(df.columns):
        socketio.emit("csv_error", {"error": "CSV must contain user, date, and activity_sequence"})
        return
    
    user= "keshav"
    date= "18/11/2003"
    activity_sequence = [18.0, 29.0, 23.0, 18.0, 29.0, 23.0, 3.0, 4.0, 8.0, 3.0, 4.0, 8.0, 3.0, 4.0, 8.0, 3.0, 4.0, 8.0, 3.0, 4.0, 7.0, 3.0, 4.0, 8.0, 3.0, 4.0, 8.0, 3.0, 4.0, 8.0, 3.0, 4.0, 8.0, 3.0, 4.0, 8.0, 3.0, 4.0, 8.0, 26.0, 27.0, 26.0, 29.0, 26.0, 27.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 27.0, 26.0, 29.0, 26.0, 27.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 11.0, 14.0, 11.0, 12.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 12.0, 11.0, 12.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 12.0, 11.0, 14.0, 11.0, 12.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 12.0, 11.0, 12.0, 11.0, 12.0, 11.0, 12.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 11.0, 14.0, 26.0, 29.0, 26.0, 27.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 27.0, 26.0, 29.0, 26.0, 27.0, 26.0, 27.0, 26.0, 28.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 26.0, 29.0, 99, 99, 99, 99, 99]
    
    process_real_time_scoring(user, date, activity_sequence)
    
     # Acknowledge upload
    socketio.emit("csv_success", {"message": "CSV uploaded and processing started!"})


@socketio.on('process_email_data')
def handle_process_email():
    # Find the latest uploaded CSV
    files = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith('.csv')]
    if not files:
        print("No CSV file found.")
        return
    
    latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(UPLOAD_FOLDER, f)))
    file_path = os.path.join(UPLOAD_FOLDER, latest_file)

    # Process email data
    process_email_data(file_path)


def process_email_data(file_name):
    df = pd.read_csv(file_name)
    
    if 'cleaned_content_x' not in df.columns:
        print("Error: 'cleaned_content_x' column not found in CSV.")
        return
    
    emails_data = []
    total_emails = 1
    # for index, email_text in enumerate(df['cleaned_content_x'].dropna()):
    index=0
    email_text="bad things angry outraged bad things leave outraged leave take seriously fault bad things two faced bad things angry outraged leave angry outraged bad things angry take seriously exacerbated angry leave leave outraged exacerbated bad things irreplaceable leave outraged take seriously bad things exacerbated exacerbated irreplaceable take seriously two faced outraged outraged two faced fault outraged fault outraged two faced exacerbated irreplaceable take seriously"    
    socketio.emit('email_processing_update', {'status': f'Processing email {index+1}/{total_emails}...'})
        
    reconstruction_error = float(analyze_email(email_text))
    similar_emails_raw = find_similar_emails(email_text)
    anomalous_words, anomaly_score = get_knowledge_base_score(email_text)
        
    highlighted_email = highlight_anomalous_words(email_text, anomalous_words)
        
        # Convert to list of dicts with rank
    similar_emails = [
            {"rank": i + 1, "similarity_score": float(score), "email": email}
            for i, (email, score) in enumerate(similar_emails_raw)
        ]
        
    email_result = {
            "email_text": highlighted_email,
            "reconstruction_error": reconstruction_error,
            "similar_emails": similar_emails,
            "anomaly_score": float(anomaly_score)
        }
    emails_data.append(email_result)
    
    socketio.emit('email_analysis', json.dumps(emails_data, indent=2))
    socketio.emit('email_processing_update', {'status': 'Processing complete!'})  # Final update


def highlight_anomalous_words(email_text, anomalous_words):
    for word in anomalous_words:
        email_text = email_text.replace(word, f"<strong>{word}</strong>")  # Use <strong> for HTML bold
    return email_text





if __name__ == "__main__":  
    socketio.run(app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)  
