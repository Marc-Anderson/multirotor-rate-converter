# multirotor-rate-converter


see it live [here](https://rates.metamarc.com/)


## purpose
provide a place where multirotor users can convert flight controller rates from one type to another


## how it works
enter your rates or rates of popular pilots to visually compare or automatically convert rates to your preferred fc software


## faq
* How do you know the rates are accurate? The rate calculations come directly from the [betaflight configurator](https://github.com/betaflight/betaflight-configurator) repo. I simply borrowed their rate calculation file and gave it a new place to show off its curves. 
* how does the automatic rate conversion work? the api takes 10 datapoints of the source curve and uses non-linear least squares to find the best fit of the rate type you want.


## feature ideas
themes
incorporate the throttle slider


## todo
- [ ] mobile
- [ ] tests


## resources


### special thanks to these wonderful projects
* [betaflight configurator](https://github.com/betaflight/betaflight-configurator)
* [rotor pirates](https://github.com/apocolipse/RotorPirates)
* [rate fitter](https://github.com/yhgillet/rateconv/tree/8e9cc846f63971820bb77f1069e79271c08e2ff2)
* [rate tuner](https://github.com/Dadibom/Rate-Tuner/tree/de57d61d8307b29d8ac6a9a926aa719ddf3d605b)
* [desmos](https://www.desmos.com/calculator/r5pkxlxhtb?fbclid=IwAR0DfRnnfMaYSUXF5g7moEjfHlwCOi84iq9WMOUaOhVQwauY-ggFDh-KpSY)


## development setup


### prerequisites
* python
* venv
* pip


### local

1. navigate to `/multirotor-rate-converter/`

2. create a python virtual environment
```
python3 -m venv .env
```

3. activate the virtual environment
```
source .env/bin/activate
```

4. install the packages in requirements.txt
```
pip install -r requirements.txt
```

5. launch the application
```
python3 wsgi.py
```

NOTE: sometimes the browser likes to cache files so either use an incognito window or hard refresh every once in a while


## development setup(docker)

**WARNING:** docker configuration has not been tested in production  

### todo
- [ ] add ssl cert


### build instructions

1. navigate to `/multirotor-rate-converter/`

2. create folder for logs, gunicorn socket and give user and group permissions
```bash
# you must manually create the volume folder on the host machine and set the group id(gid) to 1000 or it 
# will be created as root and containers will not be able to access them. in my case(wsl2) (uid/gid:1000) is
# my user and group. for experimenting, it can be bypassed by setting permissions of the folder to 777 from the host
mkdir -p ./docker_volumes/sockets && mkdir -p ./docker_volumes/log/gunicorn && mkdir ./docker_volumes/log/nginx && chmod 770 -R ./docker_volumes/
```

3. build and run 
```bash
docker compose up -d --build
```

4. configure logrotate in the host to prevent logs from growing out of control
```bash
nano /etc/logrotate.d/gunicorn 

## set the contents to the below(this is an almost copy of the nginx logrotate config)
/var/log/gunicorn/*.log {
    # attempt to rotate logs daily/weekly/monthly
    daily
    # keep 4 rotated logs
    rotate 14
    size=1M
    dateext
    dateformat -%d%m%Y
    missingok
    compress
    delaycompress
    # notifempty
        # create 0640 www-data adm
        # sharedscripts
        # prerotate
        #         if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
        #                 run-parts /etc/logrotate.d/httpd-prerotate; \
        #         fi \
        # endscript
        # postrotate
        #         invoke-rc.d nginx rotate >/dev/null 2>&1
        # endscript
}
```

5. tear it down
```bash
docker compose down
```