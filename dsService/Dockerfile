FROM python:3.12-slim

WORKDIR /app

COPY dist/dsservice-0.1.0.tar.gz .
RUN pip install --no-cache-dir dsservice-0.1.0.tar.gz

ENV FLASK_APP=app


EXPOSE 8002

CMD ["flask", "run", "--host=0.0.0.0", "--port=8002"]