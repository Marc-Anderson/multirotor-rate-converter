# FROM python:latest
FROM python:3.8

# RUN python3 -m venv .env
# RUN source .env/bin/activate

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

EXPOSE 3000

CMD ["python", "run.py"]
