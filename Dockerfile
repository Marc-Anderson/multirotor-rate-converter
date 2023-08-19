FROM python:3.8-slim

WORKDIR /usr/src/app

# RUN python3 -m venv .env
# RUN source .env/bin/activate

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

COPY . .

EXPOSE 3000

# gunicorn environment variable so you dont need to define when calling
ENV GUNICORN_CMD_ARGS="--bind=0.0.0.0:3000 --workers=1"

# call gunicorn, first app is folder, second is callable.py
CMD ["gunicorn", "app:app"]

# flask environment variables for development
# ENV FLASK_APP=app
# ENV FLASK_ENV=development
# ENV FLASK_RUN_HOST=0.0.0.0
# ENV FLASK_RUN_PORT=3000

# call the flask app directly
# CMD ["python", "wsgi.py"]

# docker build -t rate-conv .
# docker run -p 3000:3000 rate-conv
# docker start <IMAGE_ID>
# http://127.0.0.1:3000/