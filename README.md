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


# Development: Python

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
cd backend && pip3 install -r requirements.txt && cd ..
```
**Note:** the Docker build and `backend/requirements.txt` reference `./core` as a relative path, so it must be installed from inside `backend/`

#### 6. launch the application:
```sh
python3 backend/wsgi.py
```

#### 7. visit the application in your browser at `localhost:3000`.

**Note:** to avoid issues with browser caching, use an incognito window or perform a hard refresh occasionally.



# Development: Docker Compose

build an image and spin up a container containing the web app using docker compose

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

#### 3. copy the example env file
```sh
cp .env.example .env
```
the defaults work as-is for local testing, no editing needed

#### 4. build and run the docker containers using docker compose:
```sh
docker compose up -d --build
```

#### 5. access the application in your browser at `localhost:3000`

#### 6. to stop the containers:
```sh
docker compose down
```

# Production: Docker Compose


## Prerequisites
- linux vps
- docker
- ufw
- fail2ban (recommended)
- non-root user
- ssh public key for user
- a domain name with dns already pointed at this host's ip address


### tls certificates

caddy (the reverse proxy/static file server in front of the app) automatically requests and renews a let's encrypt certificate for `DOC_DOMAIN` the first time it starts, as long as that domain's dns points at this server and ports 80/443 are reachable from the internet. there's nothing to download, upload, or renew by hand.

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


#### 3. point your domain's dns at this server, then copy the example env file and set `DOC_DOMAIN` and `HTTP_PORT` (and optionally `SSL_EMAIL`)

```sh
cp .env.example .env
```

edit `.env` by hand - set `DOC_DOMAIN` to your domain and uncomment `HTTP_PORT=80` - or replace the variables below and run this command

```sh
domain_name=example.com
ssl_email_address=webmaster@example.com
sed -i -e "s/^# DOC_DOMAIN=.*/DOC_DOMAIN=$domain_name/" -e "s/^# SSL_EMAIL=.*/SSL_EMAIL=$ssl_email_address/" -e "s/^# HTTP_PORT=.*/HTTP_PORT=80/" .env
```


#### 4. enable and start fail2ban
```sh
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### 5. allow web traffic in ufw
```sh
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable
```

#### 6. Ensure that your domain is set pointing to your server before continuing
```sh
hostname -I
dig $domain_name
```

#### 7. build and run the docker containers
```sh
docker compose up -d --build
```

#### 8. visit your domain over https - caddy requests the certificate on first access, no extra steps needed

#### 9. to stop the containers:
```sh
docker compose down
```




# testing

test cases include all valid rate conversions on the website between october 2024 and april 2025. 

#### 1. install requests
```sh
pip3 install requests
```

#### 2. run the tests
```sh
cd backend/core
python3 -m unittest tests/test_000_bulk.py -f
# it will take a second to get going on the first run
# if you want to run all tests in spite of failures you can remove the -f
# `python3 -m unittest tests/test_000_bulk.py `
```


#### 3. evaluate the results

1. check the number of failures, all tests should pass
    - every 5000 tests, the system will try a random set of values
2. at the end you can review the results file in `./tests/RESULTS.txt`
3. check the error rate compared to the current `test` results
- the `test` result is the known values of the existing best solution
- upgrading to python3.13 we lost `153.94`. i hope to resolve this in the future

