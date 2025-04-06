from kafka import KafkaConsumer
import json
import logging
import threading
from socketio_instance import socketio # Import the existing SocketIO instance from app.py


# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

KAFKA_BROKER = "192.168.1.11:9092"
KAFKA_TOPIC = "anomaly-scores"

def consume_kafka_messages():
    """Kafka Consumer that listens for messages and sends them to the frontend."""
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )

    logging.info("Kafka Consumer is listening for messages...")

    for message in consumer:
        data = message.value
        logging.info(f"Received from Kafka: {data}")

        # Emit data to frontend via SocketIO
        socketio.emit("new_kafka_message", data)

# Run Kafka Consumer in a separate thread
def start_kafka_consumer():
    thread = threading.Thread(target=consume_kafka_messages, daemon=True)
    thread.start()
