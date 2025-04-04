import datetime
import time
import numpy as np
import tensorflow as tf
import json
from kafka import KafkaProducer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from socketio_instance import socketio







# Load trained LSTM Autoencoder
MODEL_PATH = "../models/best_lstm_autoencoder2.h5"
model = tf.keras.models.load_model(MODEL_PATH)

# Kafka Configuration
KAFKA_BROKER = "localhost:9092"  # Change if needed
KAFKA_TOPIC = "anomaly-scores"

producer = KafkaProducer(
    bootstrap_servers=KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)


MAX_SEQ_LENGTH = 74
WINDOW_SIZE = 5



# Activity Mapping
activity_mapping = {
    "logon_work": 0, "logoff_work": 1,
    "logon_offhours": 15, "logoff_offhours": 16,
    "file_copy_work": 2, "file_copy_offhours": 17,
    "email_sent_work": 3, "email_sent_offhours": 18,
    "email_received_work": 4, "email_received_offhours": 29,
    "email_attachment_work": 5, "email_attachment_offhours": 20,
    "email_positive_work": 6, "email_positive_offhours": 21,
    "email_negative_work": 7, "email_negative_offhours": 22,
    "email_neutral_work": 8, "email_neutral_offhours": 23,
    "thumbdrive_connected_work": 9, "thumbdrive_connected_offhours": 24,
    "thumbdrive_disconnected_work": 10, "thumbdrive_disconnected_offhours": 25,
    "http_request_work": 11, "http_request_offhours": 26,
    "http_positive_work": 12, "http_positive_offhours": 27,
    "http_negative_work": 13, "http_negative_offhours": 28,
    "http_neutral_work": 14, "http_neutral_offhours": 30
}

# Reverse mapping for label lookup
reverse_activity_mapping = {v: k for k, v in activity_mapping.items()}

# Precomputed Percentile Thresholds
percentile_thresholds = {
    25: 0.426806,
    50: 1.675899,
    75: 2.246111,
    90: 2.984831,
    95: 3.705566,
    99: 5.699694
}


def get_anomaly_score(seq):
    """Computes anomaly score using LSTM Autoencoder."""
    X = pad_sequences([seq], maxlen=MAX_SEQ_LENGTH, padding='post')
    X = X.reshape((1, MAX_SEQ_LENGTH, 1))  # Reshape for LSTM input

    reconstructions = model.predict(X, verbose=0)
    mae = np.mean(np.abs(X - reconstructions), axis=(1, 2))[0]

    return mae

def percentile_risk_scaling(mae):
    if mae <= percentile_thresholds[25]: return 1
    elif mae <= percentile_thresholds[50]: return 25
    elif mae <= percentile_thresholds[75]: return 50
    elif mae <= percentile_thresholds[90]: return 75
    elif mae <= percentile_thresholds[95]: return 90
    elif mae <= percentile_thresholds[99]: return 95
    else: return 100


def process_real_time_scoring(user, date, activity_sequence):
 
   
 # Sliding Window Processing
 current_sequence = activity_sequence[:WINDOW_SIZE]

 for i in range(WINDOW_SIZE, len(activity_sequence)):
    mae = get_anomaly_score(current_sequence)
    risk_score = percentile_risk_scaling(mae)
    
    # Get the current timestamp
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    print(i)
    print(current_sequence)
    if mae > percentile_thresholds[75]:  # Track only high MAE activities
        activity_label = reverse_activity_mapping.get(activity_sequence[i], f"Unknown ({activity_sequence[i]})")
    else:
        activity_label = "NaN"  # Show NaN for activities below 75th percentile

    # Send to Kafka
    message = {
        "user": user,
        "date": date,
        "time": timestamp,
        "activity": activity_label,
        "mae": float(mae),
        "risk_score": float(risk_score)
    }
    
    # 🔹 Send real-time logs to frontend
    socketio.emit("producer_log", {"message": f"Sent risk: {risk_score} at {timestamp}"})
    
    producer.send(KAFKA_TOPIC, message)
    

    current_sequence.append(activity_sequence[i])
    
    # Introduce a 1-second delay before the next prediction
    time.sleep(0.01)

 socketio.emit("prediction_done")
