import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Load LSTM Autoencoder Model
MODEL_PATH = r"model\best_lstm_autoencoder2.h5"
model = tf.keras.models.load_model(MODEL_PATH)
MAX_SEQ_LENGTH = 74  # Ensure consistency with training

def preprocess_csv(file_path):
    """Loads and preprocesses CSV data for LSTM autoencoder."""
    df = pd.read_csv(file_path)
    df['activity_encoded'] = df['activity_encoded'].apply(eval)
    X = pad_sequences(df['activity_encoded'], maxlen=MAX_SEQ_LENGTH, padding='post')
    return df, X

def get_anomaly_scores(df, X):
    """Calculates anomaly scores based on reconstruction error."""
    X = X.reshape((-1, MAX_SEQ_LENGTH, 1))  # Reshape for LSTM input
    reconstructions = model.predict(X)
    mse = np.mean(np.square(X - reconstructions), axis=(1, 2))  # Compute MSE
    
    # Min-Max Scaling to range 1-100
    min_score = np.min(mse)
    max_score = np.max(mse)
    
    if max_score == min_score:  # Prevent division by zero
        scaled_scores = np.ones_like(mse) * 50  # Default to mid-range
    else:
        scaled_scores = ((mse - min_score) / (max_score - min_score)) * 99 + 1

    df['anomaly_score'] = scaled_scores
    return df[['user', 'day', 'anomaly_score']].to_dict(orient='records')