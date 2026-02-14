FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ .

ENV FLASK_APP=app
ENV PYTHONUNBUFFERED=1

EXPOSE 8002

CMD ["flask", "run", "--host=0.0.0.0", "--port=8002"]