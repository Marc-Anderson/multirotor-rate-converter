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
**warning:** docker configuration has not been tested in production  

create folder for gunicorn socket and give user and group permissions
```bash
# you must manually create the volume folder on the host machine and set the group it(gid) to 1000 or it 
# will be created as root and gunicorn will not be able to access it. in my case(wsl2) (uid/gid:1000) is
# my user and group. for experimenting, it can be bypassed by setting permissions of the folder to 777 from the host
mkdir ./socket_volume && chmod 770 ./socket_volume
```

build and run 
```bash
docker compose up -d --build
```

tear it down
```bash
docker compose down
```