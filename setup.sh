#!/bin/bash

# ask the user if they are trying to set up, either `dev` or `prod`:
attempt=0
max_attempts=2
while (( attempt < max_attempts )); do
    read -p "Do you want to deploy to development or production? (prod/dev): " target_environment

    # check if the user entered `prod` or `dev`:
    if [[ $target_environment == "prod" ]]; then
        echo "Beginning production deployment..."
        break

    elif [[ $target_environment == "dev" ]]; then
        echo "Setting up develeopment environment..."
        break
        
    else
        ((attempt++))
        if (( attempt >= max_attempts )); then
            echo "Error: Maximum number of attempts reached. Exiting."
            exit 1
        else
            echo "Error: Invalid input. Please enter 'prod' or 'dev'."
        fi
    fi
done

# verify that only `dev` or `prod` was entered
if [[ ! "$target_environment" =~ ^(dev|prod)$ ]]; then
    echo "Error: Invalid environment. Allowed values are 'dev' or 'prod'." >&2
    exit 1
fi

# load the environment variables from the appropriate `.env` file and create an associative array
declare -A env_vars
while IFS='=' read -r key value; do
    # ignore lines that start with a comment (#) or are empty
    if [[ ! $key =~ ^# && ! -z $key ]]; then
        # trim spaces from the key and value
        key=$(echo "$key" | awk '{print $1}' | sed 's/ //g')
        value=$(echo "$value" | sed 's/ //g')
        # assign the cleaned key and value to the associative array
        env_vars["$key"]="$value"
    fi
done < ".env.${target_environment}"

# # debugging: print all of the values of the associative array
# for key in "${!env_vars[@]}"; do
#     echo "$key=${env_vars[$key]}"
# done

# verify that the environment specified in the `.env` file matches the requested environment
if [[ "${env_vars[ENVIRONMENT]}" != $target_environment ]]; then
    echo "Error: The requested environment does not match the environment specified in the .env file." >&2
    read -p "Do you want to continue with the ${env_vars[ENVIRONMENT]} deployment? (y/n): " deployment_confirmation
    if [[ $deployment_confirmation =~ ^[Nn]$ ]]; then
        echo "Exiting..."
        exit 1
    fi
fi

# process the dev environment requirements
if [[ "${env_vars[ENVIRONMENT]}" == "dev" ]]; then 
    mkdir -p "${env_vars[DOC_NGINX_LOG_PATH]}"
    mkdir -p "${env_vars[DOC_GUN_LOG_PATH]}"
    mkdir -p "${env_vars[DOC_GUN_SOCK_PATH]}"
    chmod 770 -R ./docker_volumes/
    echo "Success: development folders and permissions configured"
    echo "      Next: 1. start the project with 'docker compose --env-file ./.env.dev up -d --build'"
    echo "            2. view the project at http://localhost:3000 or the ip of your host"
    echo "            3. stop the project with 'docker compose --env-file ./.env.dev down'"
    exit 0
fi

# create a local docker container user group for sharing volumes:
sudo groupadd -g "${env_vars[DOC_VOL_GRP_ID]}" -o "${env_vars[DOC_VOL_GRP]}"

# create local gunicorn and nginx users, adding the nginx user to the docker group, and disable any shell for security:
sudo useradd --shell /usr/sbin/nologin --uid "${env_vars[DOC_GUN_UID]}" "${env_vars[DOC_GUN_USR]}"


# check if theres already a user with the same id as the default nginx container
temp_existing_nginx_username=$(getent passwd "${env_vars[DOC_NGINX_UID]}" | cut -d: -f1)


# create nginx user if it does not exist
if [ -z "$temp_existing_nginx_username" ]; then
    sudo useradd --shell /usr/sbin/nologin --uid "${env_vars[DOC_NGINX_UID]}" "${env_vars[DOC_NGINX_USR]}"
else
    echo "nginx container user already exists, using id 101"
    env_vars["DOC_NGINX_USR"]="$temp_existing_nginx_username"
fi

# add the nginx user to the docker group
sudo usermod -aG "${env_vars[DOC_VOL_GRP]}" "${env_vars[DOC_NGINX_USR]}"

# create nginx/gunicorn log directories and set the correct permissions matching the `.env.prod` file:
sudo mkdir -p "${env_vars[DOC_NGINX_LOG_PATH]}"
sudo chown "${env_vars[DOC_NGINX_UID]:-$(id -u)}:${env_vars[DOC_NGINX_UID]}" "${env_vars[DOC_NGINX_LOG_PATH]}"
sudo chmod 750 -R "${env_vars[DOC_NGINX_LOG_PATH]}"
# 
sudo mkdir -p "${env_vars[DOC_GUN_LOG_PATH]}"
sudo chown "${env_vars[DOC_GUN_USR]}":root "${env_vars[DOC_GUN_LOG_PATH]}"
sudo chmod 750 -R "${env_vars[DOC_GUN_LOG_PATH]}"

# create gunicorn socket directory and set the correct permissions matching the `.env.prod` file:
sudo mkdir -p "${env_vars[DOC_GUN_SOCK_PATH]}"
sudo chown "${env_vars[DOC_GUN_USR]}":"${env_vars[DOC_VOL_GRP]}" "${env_vars[DOC_GUN_SOCK_PATH]}"
sudo chmod 770 -R "${env_vars[DOC_GUN_SOCK_PATH]}"

# create ssl directory under the domain `"${env_vars[DOC_CERT_PATH]}"/example.com` and copy your ssl certificates to it
sudo mkdir -p "${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}"
sudo chown "${env_vars[DOC_NGINX_UID]:-$(id -u)}":"${env_vars[DOC_NGINX_UID]}" -R "${env_vars[DOC_CERT_PATH]}"
sudo chmod 750 -R /etc/nginx

# confirm that ssl certificates are in the temp location
temp_ssl_cert_dir="./ssl_certificates/${env_vars[DOC_DOMAIN]}"
ssl_cert_dir="${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}"
ssl_success=0
if [[ ! -d "$temp_ssl_cert_dir" || -z "$(ls -A "$temp_ssl_cert_dir")" ]]; then
    echo "WARNING: ssl certificates not found in '$temp_ssl_cert_dir'."
    echo "Place your domain and private key certificate in $ssl_cert_dir and use the below commands to set permissions"
    echo "        sudo chown '${env_vars[DOC_NGINX_UID]:-$(id -u)}:${env_vars[DOC_NGINX_UID]}' '${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/domain.cert.pem'"
    echo "        sudo chown '${env_vars[DOC_NGINX_UID]:-$(id -u)}:${env_vars[DOC_NGINX_UID]}' '${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/private.key.pem'"
    echo "        sudo chmod 644 '${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/domain.cert.pem'"
    echo "        sudo chmod 640 '${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/private.key.pem'"
    
else
    # copy certificates to the ssl directory
    sudo cp -r "$temp_ssl_cert_dir"/* "${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}"

    # set permissions for certificate and private keys for nginx
    sudo chown "${env_vars[DOC_NGINX_UID]:-$(id -u)}:${env_vars[DOC_NGINX_UID]}" "${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/domain.cert.pem"
    sudo chown "${env_vars[DOC_NGINX_UID]:-$(id -u)}:${env_vars[DOC_NGINX_UID]}" "${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/private.key.pem"

    # restrict access to ssl certificates
    sudo chmod 644 "${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/domain.cert.pem"
    sudo chmod 640 "${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/private.key.pem"

    ssl_success=1
fi

# set permissions for certificate and private keys for nginx
# sudo chown "${DOC_NGINX_UID:-$(id -u)}":"${env_vars[DOC_NGINX_UID]}" "${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/domain.cert.pem"
# sudo chown "${DOC_NGINX_UID:-$(id -u)}":"${env_vars[DOC_NGINX_UID]}" "${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/private.key.pem"

# restrict access to ssl certificates
# sudo chmod 644 "${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/domain.cert.pem"
# sudo chmod 640 "${env_vars[DOC_CERT_PATH]}/${env_vars[DOC_DOMAIN]}/private.key.pem"

echo "COMMENT: production users, groups, folders and permissions configured"


# check for docker
if command -v docker &> /dev/null; then
    echo "Docker is installed."
    # do nothing
else
    echo "WARNING: Docker is not installed and is required."
fi

# check for ufw
if command -v ufw &> /dev/null; then
    # read -p "UFW is installed. Do you want to deploy to development or production? (prod/dev): " target_environment
    echo "COMMENT: ufw is installed, enable tcp ports 80 and 443"
    echo "     disable all rules except ssh and then run 'sudo ufw allow 80/tcp && sudo ufw allow 443/tcp'"

else
    echo "WARNING: ufw is not installed and is required."
fi

# check for fail2ban
if command -v fail2ban-client &> /dev/null; then

    # check if jail.local fail2ban already exists
    if [[ ! -f /etc/fail2ban/jail.local ]]; then
        # copy the default fail2ban config file to a jail.local file
        # echo "copying /etc/fail2ban/jail.conf to ...jail.local"
        sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    else
        echo "CAUTION: /etc/fail2ban/jail.local already exists, not copied."
    fi

    # check if [docker-nginx] exist in jail.local 
    if grep -q "^\[docker-nginx\]" /etc/fail2ban/jail.local; then

        echo "CAUTION: [docker-nginx] directive in /etc/fail2ban/jail.local already exists, not added."
    
    else
        # add a reference to the new nginx log location for our docker container to the bottom of the file
        echo -e "\n\n\n" | sudo tee -a /etc/fail2ban/jail.local > /dev/null
        echo -e "# new nginx log location for docker container" | sudo tee -a /etc/fail2ban/jail.local > /dev/null
        echo -e "[docker-nginx]" | sudo tee -a /etc/fail2ban/jail.local > /dev/null
        echo -e "filter  = nginx-http-auth" | sudo tee -a /etc/fail2ban/jail.local > /dev/null
        echo -e "port    = http,https" | sudo tee -a /etc/fail2ban/jail.local > /dev/null
        echo -e "logpath = /var/log/nginx-docker/*log" | sudo tee -a /etc/fail2ban/jail.local > /dev/null

        echo "COMMENT: fail2ban configured for new nginx log location"
    fi
else
    echo "WARNING: Fail2ban is not installed. New nginx log location for docker container not configured."
fi


echo "COMMENT: adding logrotate configuration for gunicorn container"
# create a new logrotate file for gunicorn and add a log configuration
sudo tee /etc/logrotate.d/gunicorn > /dev/null <<'EOF'
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
EOF

# if ssl_success then echo hello
if [[ $ssl_success -eq 0 ]]; then
    echo "WARNING: DO NOT CONTINUE UNTIL SSL CERTIFICATES ARE IN PLACE"
fi
echo "      Next: 1. start the project with 'docker compose --env-file ./.env.prod up -d --build'"
echo "            2. view the project at ${env_vars[DOC_DOMAIN]} or the ip of your host"
echo "            3. stop the project with 'docker compose --env-file ./.env.prod down'"
exit 0