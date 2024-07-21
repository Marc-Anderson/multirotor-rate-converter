# Multirotor Rate Converter


See it live [here](https://rates.metamarc.com/)


## Purpose
The Multirotor Rate Converter aims to provide multirotor enthusiasts with a tool to convert flight controller (FC) rates from one type to another.

## How It Works
Users can input their own rates or the rates of popular pilots to visually compare them. Additionally, the tool allows for the automatic conversion of these rates to a format of another flight controller software.

## Frequently Asked Questions (FAQ)

### How do you ensure the rates are accurate?
The rate calculations are derived directly from the [Betaflight Configurator](https://github.com/betaflight/betaflight-configurator) repository. This tool simply borrows their rate calculation file and gaves it a new place to show off its curves.

### How does the automatic rate conversion work?
There are two methods for rate calculation:
1. **API-Based Calculation:** This method takes 10 data points from the source curve and uses non-linear least squares to find the best fit for the desired rate type.
2. **Local Gradient Descent:** This method uses 500 data points and Mean Squared Error (MSE) to identify the best fit.

### Why are there two calculation methods?
The on-device gradient descent calculation was developed as a proof of concept to potentially eliminate monthly server costs. However, the API-based calculation is faster and the max rate is generally more accurate to the input.

## Feature Ideas
- Implementation of different themes.
- Integration of a throttle slider.

## Todo
- [ ] Implement tests for all functionalities.

## Resources

### Special Thanks To These Wonderful Projects
- [Betaflight Configurator](https://github.com/betaflight/betaflight-configurator)
- [Rotor Pirates](https://github.com/apocolipse/RotorPirates)
- [Rate Fitter](https://github.com/yhgillet/rateconv/tree/8e9cc846f63971820bb77f1069e79271c08e2ff2)
- [Rate Tuner](https://github.com/Dadibom/Rate-Tuner/tree/de57d61d8307b29d8ac6a9a926aa719ddf3d605b)
- [Desmos](https://www.desmos.com/calculator/r5pkxlxhtb?fbclid=IwAR0DfRnnfMaYSUXF5g7moEjfHlwCOi84iq9WMOUaOhVQwauY-ggFDh-KpSY)

## Notes
- to switch between local rate calculation and using the api, add or remove both the `legacy` and `new-layout` classes on the `convert-btn`

# Local Development

## Python Flask Development Instructions

### Prerequisites
- python3.8
- virtual environment (`venv`)
- pip


### Setup

1. navigate to the `/multirotor-rate-converter/` directory.
2. create a python virtual environment:
```bash
python3 -m venv .venv
# on macos, you may need to use:
# /usr/bin/python3 -m venv .venv
```
3. activate the virtual environment:
```bash
source .venv/bin/activate
```
4. install the required packages:
```bash
pip install -r requirements.txt
```
5. launch the application:
```bash
python3 wsgi.py
```
6. access the application in your browser at `localhost:3000`.

**Note:** to avoid issues with browser caching, use an incognito window or perform a hard refresh occasionally.



## Docker Build Development Instructions

### Prerequisites
- docker

### Setup

1. navigate to the `/multirotor-rate-converter/` directory.
2. create a `docker_volumes` folder within the project directory.
3. create directories within the `docker_volumes` folder for logs and the gunicorn socket as defined in the `.env.dev` file:
    * you must manually create these on the host or it will be owned by root and containers will not be able to access them
    * if you change them, these should match exactly whats found in the env.dev file
    * if you run into permission issues, remove the docker_volumes folder from the host entirely and recreate the folders
```bash
mkdir -p ./docker_volumes/var/log/nginx-docker
mkdir -p ./docker_volumes/var/log/gunicorn-docker
mkdir -p ./docker_volumes/run/gunicorn-docker
```
4. set permissions for the `docker_volumes` folder and its contents:
```bash
chmod 770 -R ./docker_volumes/
```
5. build and run the docker containers:
```bash
docker compose --env-file ./.env.dev up -d --build
```
6. access the application in your browser at `127.0.0.1:3000`.
7. to stop the containers:
```bash
docker compose --env-file ./.env.dev down
```

### Docker Development Quick Setup Scripts

#### Linux:
Automatically create the required folders with the correct permissions extracted from the `.env.dev` file:
```bash
# linux - extract the log paths from the .env.dev file and execute them as environment variables
while IFS='=' read -r key value; do export "$key=$value";  done < <(grep 'PATH=' .env.dev | awk -F 'PATH=' '{print $1 "PATH_HOST="$2}' | sed 's/ //g')
# linux - create the folder required directories from the environment variables
mkdir -p $DOC_NGINX_LOG_PATH_HOST && mkdir -p $DOC_GUN_LOG_PATH_HOST && mkdir -p $DOC_GUN_SOCK_PATH_HOST && chmod 770 -R ./docker_volumes/
```

#### Windows(WORKS BUT NOT THROUGHLY TESTED)  
automatically create required folders with correct permissions extracted from the env.dev file
```bash
# windows - extract the log paths from the .env.dev file and execute them as environment variables
for /f "tokens=1,* delims==" %i in ('findstr "PATH=" .env.dev') do @set "%i_HOST=%j" && set %i_HOST=%j
# windows - create the folder required directories from the environment variables
mkdir %DOC_NGINX_LOG_PATH_HOST:/=\% %DOC_GUN_LOG_PATH_HOST:/=\% %DOC_GUN_SOCK_PATH_HOST:/=\%
```



# Production Setup

## Static On Device Rate Calculation

1. copy the contents of the `app/static` folder to your web server
2. make sure the button with the class `convert-btn` in the `index.html` file does not have the classes `legacy` or `new-layout`


## Docker Build Production Instructions

### Todo
- [ ] add ssl certificate
    * https://forums.docker.com/t/docker-compose-letsencrypt-nginx-certbot-expectations/140052
    * https://community.letsencrypt.org/t/letsencrypt-certbot-configuration-secuity/213973
    * https://phoenixnap.com/kb/letsencrypt-docker

### Prerequisites
- docker
- ufw (recommended)
- fail2ban (recommended)

### Comments
- you must manually create directories on the host machine or they will be owned by root and containers will not be able to access them.
- ensure directory paths match the `.env` file configuration you are using.

### Docker Deployment Instructions

1. navigate to the `/multirotor-rate-converter/` directory.
2. create a local docker container user group for sharing volumes:
```bash
groupadd -g 1700 -o docker_grp
```
3. create local gunicorn and nginx users, adding the nginx user to the docker group, and disable any shell for security:
```bash
useradd --shell /usr/sbin/nologin --uid 1802 doc_gunicorn
useradd --shell /usr/sbin/nologin --uid 1801 doc_nginx && usermod -aG docker_grp doc_nginx
```
4. create nginx/gunicorn log directories and set the correct permissions matching the `.env.prod` file:
```bash
mkdir -p /var/log/nginx-docker && chown 101:doc_nginx /var/log/nginx-docker && chmod 750 -R /var/log/nginx-docker
mkdir -p /var/log/gunicorn-docker && chown doc_gunicorn:root /var/log/gunicorn-docker && chmod 750 -R /var/log/gunicorn-docker
```

5. create gunicorn socket directory and set the correct permissions matching the `.env.prod` file:
```bash
mkdir -p /run/gunicorn-docker && chown doc_gunicorn:docker_grp /run/gunicorn-docker && chmod 770 -R /run/gunicorn-docker
```

6. build and run the docker containers:
```bash
docker compose --env-file ./.env.prod up -d --build
```
7. access the application in your browser using the server's ip address.
8. to stop the containers:
```bash
docker compose --env-file ./.env.prod down
```
9. optionally, configure fail2ban with the new nginx log location:
```bash
# copy the default fail2ban config file to a jail.local file
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# add a reference to the new nginx log location for our docker container to the bottom of the file
nano /etc/fail2ban/jail.local

# new nginx log location for docker container
[docker-nginx]
filter  = nginx-http-auth
port    = http,https
logpath = /var/log/nginx-docker/*log
```

10. optionally, configure log rotation on the host to manage log sizes:
```bash
# create a new logrotate file for gunicorn and add a log configuration
nano /etc/logrotate.d/gunicorn

# logrotate settings for gunicorn

# rotate gunicorn logs to prevent them from consuming all of the storage
/var/log/gunicorn/*.log {
    monthly
    maxsize 20M
    # keep n rotated logs
    rotate 3
    # add date to archives
    dateext
    missingok
    compress
    delaycompress
    # dont rotate if empty
    notifempty
    # copy log and remove content instead of deleting it
    copytrucate
}
```


#### Docker Build Production Quick Setup Scripts

automatically create required folders with correct permissions extracted from the env.prod file
```bash
# linux - extract the log paths from the .env file and execute them as environment variables
while IFS='=' read -r key value; do export "$key=$value";  done < <(grep '^DOC_' .env.prod)

# Create the docker container user group for sharing volumes
groupadd -g $DOC_VOL_GRP_ID -o $DOC_VOL_GRP

# Create the users and add nginx to docker group
useradd --shell /usr/sbin/nologin --uid $DOC_GUN_UID $DOC_GUN_USR
useradd --shell /usr/sbin/nologin --uid $DOC_NGINX_UID $DOC_NGINX_USR && usermod -aG $DOC_VOL_GRP $DOC_NGINX_USR

# todo: review this for nginx logs permissions
# create nginx/gunicorn log directory and set the correct permissions
mkdir -p $DOC_NGINX_LOG_PATH && chown 101:$DOC_NGINX_USR $DOC_NGINX_LOG_PATH && chmod 750 -R $DOC_NGINX_LOG_PATH
mkdir -p $DOC_GUN_LOG_PATH && chown $DOC_GUN_USR:root $DOC_GUN_LOG_PATH && chmod 750 -R $DOC_GUN_LOG_PATH

# create gunicorn socket directory and set the correct permissions
mkdir -p $DOC_GUN_SOCK_PATH && chown $DOC_GUN_USR:$DOC_VOL_GRP $DOC_GUN_SOCK_PATH && chmod 770 -R $DOC_GUN_SOCK_PATH
```


configure fail2ban with new nginx log location
```bash
# copy the default fail2ban config file and add new nginx log location to the bottom
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local && echo -e "\n\n[docker-nginx]\nfilter  = nginx-http-auth\nport    = http,https\nlogpath = /var/log/nginx-docker/*log" >> /etc/fail2ban/jail.local
```


create a logrotate file on the host to prevent logs from growing out of control
```bash
# this one liner is provided to make the creation easier, you can also create it manually to your preference
echo -e "# logrotate settings for gunicorn\n\n# rotate gunicorn logs to prevent them from consuming all of the storage\n/var/log/gunicorn/*.log {\n    monthly\n    maxsize 20M\n    # keep n rotated logs\n    rotate 3\n    # add date to archives\n    dateext\n    missingok\n    compress\n    delaycompress\n    # dont rotate if empty\n    notifempty\n    # copy log and remove content instead of deleting it\n    copytrucate\n}" > /etc/logrotate.d/gunicorn
```