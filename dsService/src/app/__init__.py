import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from flask import request, jsonify
from app.service.messageService import MessageService

app = Flask(__name__)

app.config.from_pyfile('config.py')

messageService = MessageService()

@app.route('/v1/ds/message', methods=['POST'])
def handle_message():
  message = request.json.get('message')
  result = messageService.process_message(message)
  return jsonify(result.model_dump())


@app.route('/v1/ds/health', methods=['GET'])
def health_check():
  return jsonify({'status': 'ok'})

if __name__ == "__main__":
  app.run(host = "localhost", port = 8000, debug = True)