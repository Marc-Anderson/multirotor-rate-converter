FROM python:3.8-slim

WORKDIR /usr/src/app

# RUN python3 -m venv .env
# RUN source .env/bin/activate

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3000

ENV FLASK_APP=app
ENV FLASK_ENV=development
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=3000

CMD ["python", "wsgi.py"]


# docker build -t rate-conv .
# docker run -p 3000:3000 rate-conv
# docker start <IMAGE_ID>
# http://127.0.0.1:3000/