import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from flask import request, jsonify
from app.service.messageService import MessageService
from kafka import KafkaProducer
import json

app = Flask(__name__)

app.config.from_pyfile('config.py')

messageService = MessageService()

producer = KafkaProducer(
    bootstrap_servers=os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9093'),
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

@app.route('/v1/ds/message', methods=['POST'])
def handle_message():
  message = request.json.get('message')
  result = messageService.process_message(message)
  serialized_result = result.dict()
  producer.send('expense_service', serialized_result)
  return jsonify(result.dict())


@app.route('/v1/ds/health', methods=['GET'])
def health_check():
  return jsonify({'status': 'ok'})

if __name__ == "__main__":
  app.run(host = "localhost", port = 8002, debug = True)