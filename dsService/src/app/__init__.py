import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from flask import request, jsonify
from app.service.messageService import MessageService
from kafka import KafkaProducer
import json

app = Flask(__name__)
import sys
print("DS SERVICE STARTING - NEW CODE LOADED", file=sys.stderr)
sys.stderr.flush()

app.config.from_pyfile('config.py')

messageService = MessageService()

import time

def get_kafka_producer():
    retries = 10
    while retries > 0:
        try:
            return KafkaProducer(
                bootstrap_servers=os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9093'),
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
        except Exception as e:
            print(f"Failed to connect to Kafka: {e}. Retrying in 5 seconds...")
            time.sleep(5)
            retries -= 1
    raise Exception("Could not connect to Kafka after multiple retries")

producer = get_kafka_producer()

@app.route('/v1/ds/message', methods=['POST'])
def handle_message():
  message = request.json.get('message')
  user_id = request.json.get('user_id')
  
  result = messageService.process_message(message)
  
  if result:
      serialized_result = result.dict()
      # Inject user_id into the payload for expense service
      if user_id:
          serialized_result['user_id'] = user_id
      
      print(f"Sending to Kafka: {serialized_result}", file=sys.stderr)
      sys.stderr.flush()
      producer.send('expense_service', serialized_result)
      return jsonify(serialized_result)
  else:
      return jsonify({"error": "Failed to extract expense"}), 400


@app.route('/v1/ds/health', methods=['GET'])
def health_check():
  return jsonify({'status': 'ok'})

if __name__ == "__main__":
  app.run(host = "localhost", port = 8002, debug = True)