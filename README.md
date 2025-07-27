# Multirotor Rate Converter


See it live [here](https://rates.metamarc.com/)


## Purpose
The Multirotor Rate Converter aims to provide multirotor enthusiasts with a tool to convert flight controller (FC) rates from one type to another.

## How It Works
Users can input their own rates or the rates of popular pilots to visually compare them. Additionally, the tool allows for the automatic conversion of these rates to a format of another flight controller software.

## Frequently Asked Questions (FAQ)

### How do you ensure the rates are accurate?
The rate calculations are derived directly from the [Betaflight Configurator](https://github.com/betaflight/betaflight-configurator) repository. This tool simply borrows their rate calculation file and gives it a new place to show off its curves.

### How does the automatic rate conversion work?
There are two methods for rate calculation:
1. **API-Based Calculation:** This method takes 10 data points from the source curve and uses non-linear least squares to(try to) find the best fit for the desired rate type.
2. **Local Gradient Descent:** This method uses 500 data points and Mean Squared Error (MSE) to identify the best fit.

### Why are there two calculation methods?
The on-device gradient descent calculation was developed as a proof of concept to potentially reduce monthly server costs. However, the API-based calculation is faster and the max rate is generally more accurate to the input.

## Feature Ideas
- Implementation of different themes.
- Integration of a throttle slider.

## Todo
- [ ] Implement tests for all functionalities.
- [ ] [set colors for fc options](https://blog.unmanned.tech/flight-controller-firmware/)
    - [ ] betaflight - `rgb(238, 166, 0);`
    - [ ] raceflight - `rgb(182, 25, 22);`
    - [ ] kiss - `none? maybe light gray`
    - [ ] actual - `rgb(25, 120, 178)`
    - [ ] quick - `rgb(231, 33, 31)`


## Resources

### Special Thanks To These Wonderful Projects
- [Betaflight Configurator](https://github.com/betaflight/betaflight-configurator)
- [Rotor Pirates](https://github.com/apocolipse/RotorPirates)
- [Rate Fitter](https://github.com/yhgillet/rateconv/tree/8e9cc846f63971820bb77f1069e79271c08e2ff2)
- [Rate Tuner](https://github.com/Dadibom/Rate-Tuner/tree/de57d61d8307b29d8ac6a9a926aa719ddf3d605b)
- [Desmos](https://www.desmos.com/calculator/r5pkxlxhtb?fbclid=IwAR0DfRnnfMaYSUXF5g7moEjfHlwCOi84iq9WMOUaOhVQwauY-ggFDh-KpSY)


# Development: Python Flask

For local testing without docker, you can run the project and serve the web app using just python and flask

## Prerequisites
- python3.8
- virtual environment (`venv`)
- pip


## Setup

#### 1. download or clone this repository

if you dont have git installed you can visit [this link to the repo](https://github.com/Marc-Anderson/multirotor-rate-converter.git) and download the zip file by clicking `code` > `download zip`

```sh
git clone https://github.com/Marc-Anderson/multirotor-rate-converter.git
```

#### 2. navigate to the project directory
```sh
cd multirotor-rate-converter
```

#### 3. create a python virtual environment:
```sh
python3 -m venv .venv
```

#### 4. activate the virtual environment:
```sh
source .venv/bin/activate
```

#### 5. install the required packages:
```sh
pip3 install -r backend/requirements.txt
```

#### 6. launch the application:
```sh
python3 backend/wsgi.py
```

#### 7. visit the application in your browser at `localhost:3000`.

**Note:** to avoid issues with browser caching, use an incognito window or perform a hard refresh occasionally.



# Development: Docker Compose

build an image and spin up a container containing the web app using docker compose. these development instructions will keep all files within the project folder

## Prerequisites
- linux, wsl2 in windows or multipass on macos
- docker
- non-root user
- git(recommeded)

## Setup


#### 1. download or clone this repository

if you dont have git installed you can visit [this link to the repo](https://github.com/Marc-Anderson/multirotor-rate-converter.git) and download the zip file by clicking `code` > `download zip`

```sh
git clone https://github.com/Marc-Anderson/multirotor-rate-converter.git
```

#### 2. navigate to the project directory
```sh
cd multirotor-rate-converter
```

#### 3. automatically create folder structure with permissions using a setup script

```sh
# make the setup file executable
sudo chmod +x ./setup.sh
# run the setup script
./setup.sh
# follow the instructions for `dev`
```

<details>

<summary>Click To Expand: instructions for manually creating folder structure with required permissions instead</summary>
<br />

#### manually create folder structure

some users prefer not to run setup scripts for security reasons. the below steps walk you through the manual creation of the required folder structure 

#### 1. create a `docker_volumes` folder within the project directory
```sh
mkdir docker_volumes
```

#### 2. create required directories within the `docker_volumes` folder

you must create these logs and gunicorn socket folders as defined in the `.env` file if you dont create these on the host they will be owned by root and containers will not be able to access them

```sh
mkdir -p ./docker_volumes/var/log/nginx-docker
mkdir -p ./docker_volumes/var/log/gunicorn-docker
mkdir -p ./docker_volumes/run/gunicorn-docker
```

#### 4. set permissions for the `docker_volumes` folder and its contents:
```sh
chmod 770 -R ./docker_volumes/
```

</details>


#### 4. build and run the docker containers using docker compose:
```sh
docker compose --env-file ./.env.dev up -d --build
```

#### 5. access the application in your browser at the ip address of your host, port `3000` (e.g. `127.0.0.1:3000`).

#### 6. to stop the containers:
```sh
docker compose --env-file ./.env.dev down
```

# Production: Docker Compose


## Prerequisites
- linux vps
- docker
- ufw
- fail2ban (recommended)
- non-root user
- ssh public key for user
- a domain name
- ssl certificate(domain key, and private key)


### ssl certificates

ssl certificates and renewal is an involved process. you may be able to deploy and manage them with certbot or caddy but for this deployment we use ssl certificate files which do not renew automatically
* you can download your certificates from your dns provider which expire every 30-90 days
* place these certificates in `./ssl_certificates/yourdomain.com`
* you will need to upload new certificates once per month and restart the containers for nginx to recognize them
* alternative options:
    * https://forums.docker.com/t/docker-compose-letsencrypt-nginx-certbot-expectations/140052
    * https://community.letsencrypt.org/t/letsencrypt-certbot-configuration-secuity/213973
    * https://phoenixnap.com/kb/letsencrypt-docker

<details>

<summary>Click To Expand: overview of server config</summary>
<br />

#### configure server with non-root user, ufw, fail2ban and docker

this guide isnt going to cover this entirely but here is a brief overview with commands

```sh
# 1. create a new droplet on digitalocean
# 2. select the marketplace images > docker
# 3. choose the smallest possible vps
# 4. log into the console as root from the website ui
# 5. continue with the below steps

# define a non-root username and ssh public key
# default password will be your username
USERNAME=docker_user
SSH_KEY_NAME="computer"
SSH_PUBLIC_KEY=""
# EXAMPLE_SSH_PUBLIC_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBZzHpY7r6bRpN2u/9eLsPYkbZK8ZwCff9yM7qXzjV5b fakeuser@example.com"
TEMP_PASSWORD=$USERNAME

# make sure you provided a public key
if [ -z "$SSH_PUBLIC_KEY" ]; then
    echo "Error: SSH_PUBLIC_KEY is empty."
    exit 1
fi

# update package list and install required tools
sudo apt-get update && sudo apt-get install -y ufw git fail2ban

# disable firewall
sudo ufw disable
# reset firewall to remove all rules
sudo echo "y" | sudo ufw reset
# allow but limit ssh
sudo ufw limit 22/tcp
# re-enable firewall
sudo echo "y" | sudo ufw enable
# confirm firewall status for JUST ssh
sudo ufw status

# create user and add them to the sudo group
useradd --create-home --shell /bin/bash --groups sudo "${USERNAME}"

# add the user to the docker group if it exists
if command -v docker >/dev/null 2>&1; then usermod -aG docker "${USERNAME}"; fi

# give the user a default password
echo "${USERNAME}:${TEMP_PASSWORD}" | chpasswd

# force password reset on next login
# password defaults to username
chage --lastday 0 "${USERNAME}"

# create ssh directory for new user
home_directory="$(eval echo ~${USERNAME})"
mkdir --parents "${home_directory}/.ssh"

# add specified public key to authorized keys for new user with the key description as a comment
echo "# ${SSH_KEY_NAME}" >> "${home_directory}/.ssh/authorized_keys"
echo $SSH_PUBLIC_KEY >> "${home_directory}/.ssh/authorized_keys"

# update the permissions of the ssh folder and files
chmod 0700 "${home_directory}/.ssh"
chmod 0600 "${home_directory}/.ssh/authorized_keys"
chown --recursive "${USERNAME}":"${USERNAME}" "${home_directory}/.ssh"

# switch to the new user
sudo su - $USERNAME
```
</details>

## Setup


#### 1. download or clone this repository to the host

if you dont have git installed you can visit [this link to the repo](https://github.com/Marc-Anderson/multirotor-rate-converter.git) and download the zip file by clicking `code` > `download zip`

```sh
git clone https://github.com/Marc-Anderson/multirotor-rate-converter.git
```


#### 2. navigate to the project directory
```sh
cd multirotor-rate-converter
```


#### 3. organize your ssl certificates

you should have an domain key, and a private key from your domain registrar. rename both files as below and place them in the new folder, place that folder in the `ssl_certificates` folder

ssl certificates should be organized in their own domains folder. we're only working with one domain right now, but this keeps us organized in case we introduce multiple domains in the future

```sh
# ./ssl_certificates/example.com/domain.cert.pem
# ./ssl_certificates/example.com/private.key.pem
```


#### 4. update the `DOC_DOMAIN` value in the `.env.prod` file with your domain name

you can do this manually or replace example.com below with your domain name and use these commands

```sh
domain_name=example.com
sed -i "s/^DOC_DOMAIN=.*/DOC_DOMAIN=$domain_name/" .env.prod
```


#### 5. automatically create folder structure with permissions using a setup script

```sh
# make the setup file executable and run it
sudo chmod +x ./setup.sh
./setup.sh
```

<details>

<summary>Click To Expand: instructions for manually creating users, folder structure with required permissions instead</summary>
<br />

#### 6. create a local docker container user group for sharing volumes:
```sh
sudo groupadd -g 1700 -o docker_grp
```

#### 7. create local gunicorn user, add the nginx user to the docker group, and disable any shell for security:
```sh
sudo useradd --shell /usr/sbin/nologin --uid 1802 doc_gunicorn

# by default the nginx container user is 101 `systemd-resolve` so thats the user we will use here
sudo usermod -aG docker_grp systemd-resolve
```

#### 8. create nginx/gunicorn log directories and set the correct permissions matching the `.env.prod` file:
```sh
sudo mkdir -p /var/log/nginx-docker
sudo chown 101:101 /var/log/nginx-docker
sudo chmod 750 -R /var/log/nginx-docker

sudo mkdir -p /var/log/gunicorn-docker
sudo chown doc_gunicorn:root /var/log/gunicorn-docker
sudo chmod 750 -R /var/log/gunicorn-docker
```

#### 9. create gunicorn socket directory and set the correct permissions matching the `.env.prod` file:
```sh
sudo mkdir -p /run/gunicorn-docker
sudo chown doc_gunicorn:docker_grp /run/gunicorn-docker
sudo chmod 770 -R /run/gunicorn-docker
```

#### 10. create ssl directory directory under your domain `/etc/nginx/ssl/example.com` and copy your ssl certificates to it

replace example.com below with your domain name

```sh
# update your domain name here
domain_name=example.com

sudo mkdir -p /etc/nginx/ssl/$domain_name

# can this be root:root?
sudo chown 101:101 -R /etc/nginx/ssl
sudo chmod 750 -R /etc/nginx

sudo cp -r ./ssl_certificates/$domain_name/* /etc/nginx/ssl/$domain_name
# set permissions for certificate and private keys

sudo chown 101:101 /etc/nginx/ssl/$domain_name/domain.cert.pem
sudo chown 101:101 /etc/nginx/ssl/$domain_name/private.key.pem

sudo chmod 644 /etc/nginx/ssl/$domain_name/domain.cert.pem
sudo chmod 640 /etc/nginx/ssl/$domain_name/private.key.pem
```

#### 11. create new fail2ban config with the location of the nginx logs

if you dont do this, fail2ban wont be able to find the logs so it can block people abusing the server

```sh
# copy the default fail2ban config file to a jail.local file
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# add a reference to the new nginx log location for our docker container to the bottom of the file
sudo nano /etc/fail2ban/jail.local

# new nginx log location for docker container
[docker-nginx]
filter  = nginx-http-auth
port    = http,https
logpath = /var/log/nginx-docker/*log
```


#### 12. create new logrotate config with the location of the gunicorn

if you dont do this, the logs for gunicorn may grow out of control and take over your servers storage

```sh
# create a new logrotate file for gunicorn and add a log configuration
sudo nano /etc/logrotate.d/gunicorn

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

</details>


#### 6. enable and start fail2ban
```sh
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### 7. enable and allow website traffic in ufw
```sh
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable
```

#### 8. build and run the docker containers
```sh
docker compose --env-file ./.env.prod up -d --build
# docker compose --env-file ./.env.prod up --build
```

#### 9. test access the application in your browser using the server's ip address

#### 10. access the application in your browser using your domain name

#### 11. to stop the containers:
```sh
docker compose --env-file ./.env.prod down
```
