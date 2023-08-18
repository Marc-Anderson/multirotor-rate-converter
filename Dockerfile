# FROM python:latest
FROM python:3.8

# RUN python3 -m venv .env
# RUN source .env/bin/activate

WORKDIR /usr/src/app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3000

ENV FLASK_APP=app
ENV FLASK_ENV=development
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=3000

CMD ["python", "run.py"]


# docker build -t rate-conv .
# docker run -p 3000:3000 rate-conv
# http://127.0.0.1:3000/