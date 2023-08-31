# Multirotor Rate Converter


See it live [here](https://rates.metamarc.com/)


## Purpose
provide a place where multirotor users can convert flight controller rates from one type to another


## How It Works
enter your rates or rates of popular pilots to visually compare or automatically convert rates to your preferred fc software


## FAQ
* How do you know the rates are accurate? The rate calculations come directly from the [betaflight configurator](https://github.com/betaflight/betaflight-configurator) repo. I simply borrowed their rate calculation file and gave it a new place to show off its curves. 
* How does the automatic rate conversion work? The api takes 10 datapoints of the source curve and uses non-linear least squares to find the best fit of the rate type you want.


## Feature Ideas
 - themes
 - incorporate the throttle slider


## Todo
- [ ] mobile
- [ ] tests


## Resources


### Special Thanks To These Wonderful Projects
* [betaflight configurator](https://github.com/betaflight/betaflight-configurator)
* [rotor pirates](https://github.com/apocolipse/RotorPirates)
* [rate fitter](https://github.com/yhgillet/rateconv/tree/8e9cc846f63971820bb77f1069e79271c08e2ff2)
* [rate tuner](https://github.com/Dadibom/Rate-Tuner/tree/de57d61d8307b29d8ac6a9a926aa719ddf3d605b)
* [desmos](https://www.desmos.com/calculator/r5pkxlxhtb?fbclid=IwAR0DfRnnfMaYSUXF5g7moEjfHlwCOi84iq9WMOUaOhVQwauY-ggFDh-KpSY)




## Local Development


### Flask Build Instructions


#### Prerequisites
* python
* venv
* pip


#### Setup

1. navigate to `/multirotor-rate-converter/`

2. create a python virtual environment
```
python3 -m venv .venv
```

3. activate the virtual environment
```
source .venv/bin/activate
```

4. install the packages in requirements.txt
```
pip install -r requirements.txt
```

5. launch the application
```
python3 wsgi.py
```

6. visit it in your browser at `localhost:3000`


NOTE: sometimes the browser likes to cache files so either use an incognito window or hard refresh every once in a while



### Docker Build Instructions


#### Prerequisites
* docker


#### Setup

1. navigate to `/multirotor-rate-converter/`


2. create a docker_volumes folder within the project directory


3. create directories within the docker_volumes folder for both containers logs and gunicorn socket defined in the .env.dev file
    * you must manually create these on the host or it will be owned by root and containers will not be able to access them
    * if you change them, these should match exactly whats found in the env.dev file
    * if you run into permission issues, remove the docker_volumes folder from the host entirely and recreate the folders
```bash
mkdir -p ./docker_volumes/var/log/nginx-docker
mkdir -p ./docker_volumes/var/log/gunicorn-docker
mkdir -p ./docker_volumes/run/gunicorn-docker
```


4. set permissions for the docker_volumes folder and everything inside
```bash
chmod 770 -R ./docker_volumes/
```


5. build and run
```bash
docker compose --env-file ./.env.dev up -d --build
```


6. visit it in your browser at `127.0.0.1:3000`


7. tear it down
```bash
docker compose --env-file ./.env.dev down
```



#### Docker Development Quick Setup Scripts

**linux**  
automatically create required folders with correct permissions extracted from the env.dev file
```bash
# linux - extract the log paths from the .env.dev file and execute them as environment variables
while IFS='=' read -r key value; do export "$key=$value";  done < <(grep 'PATH=' .env.dev | awk -F 'PATH=' '{print $1 "PATH_HOST="$2}' | sed 's/ //g')
# linux - create the folder required directories from the environment variables
mkdir -p $DOC_NGINX_LOG_PATH_HOST && mkdir -p $DOC_GUN_LOG_PATH_HOST && mkdir -p $DOC_GUN_SOCK_PATH_HOST && chmod 770 -R ./docker_volumes/
```

<!-- WORKS BUT NOT TESTED
**windows**  
automatically create required folders with correct permissions extracted from the env.dev file
```bash
# windows - extract the log paths from the .env.dev file and execute them as environment variables
for /f "tokens=1,* delims==" %i in ('findstr "PATH=" .env.dev') do @set "%i_HOST=%j" && set %i_HOST=%j
# windows - create the folder required directories from the environment variables
mkdir %DOC_NGINX_LOG_PATH_HOST:/=\% %DOC_GUN_LOG_PATH_HOST:/=\% %DOC_GUN_SOCK_PATH_HOST:/=\%
```
-->




## Production Setup(Docker)


### Todo
- [ ] add ssl cert


### Prerequisites
* docker
* ufw(recommended)
* fail2ban(recommended)

### Comments

* you must manually create directories on the host machine or they will be owned by root and containers will not be able to access them
* if you change them values below, they should match exactly whats found in the env file you are using


### Docker Deployment Instructions


1. navigate to `/multirotor-rate-converter/`


2. Create a local docker container user group for sharing the docker volumes
```bash
groupadd -g 1700 -o docker_grp
```


3. Create local gunicorn and nginx users and add nginx user to docker group
    * disable any shell for these users so they cant do anything if compromised
```bash
useradd --shell /usr/sbin/nologin --uid 1802 doc_gunicorn
useradd --shell /usr/sbin/nologin --uid 1801 doc_nginx && usermod -aG docker_grp doc_nginx
```


2. create nginx/gunicorn log directories on the host and set the correct permissions matching the values in .env.prod
```bash
mkdir -p /var/log/nginx-docker && chown 101:doc_nginx /var/log/nginx-docker && chmod 750 -R /var/log/nginx-docker
mkdir -p /var/log/gunicorn-docker && chown doc_gunicorn:root /var/log/gunicorn-docker && chmod 750 -R /var/log/gunicorn-docker
```


3. create gunicorn socket directory and set the correct permissions matching the values in .env.prod
```bash
mkdir -p /run/gunicorn-docker && chown doc_gunicorn:docker_grp /run/gunicorn-docker && chmod 770 -R /run/gunicorn-docker
```


4. build and run
```bash
docker compose --env-file ./.env.prod up -d --build
```


5. visit it in your browser at the ip address of your server


6. tear it down
```bash
docker compose --env-file ./.env.prod down
```


7. optional: configure fail2ban with new nginx log location
```bash
# copy the default fail2ban config file to a jail.local file
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

```bash
# add a reference to the new nginx log location for our docker container to the bottom of the file
nano /etc/fail2ban/jail.local

# new nginx log location for docker container
[docker-nginx]
filter  = nginx-http-auth
port    = http,https
logpath = /var/log/nginx-docker/*log
```


8. optional: configure logrotate on the host to prevent logs from growing out of control
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


#### Docker Production Quick Setup Scripts

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
