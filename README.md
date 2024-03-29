# multirotor-rate-converter

see it live [here](https://rates.metamarc.com/)

## purpose
provide a place where multirotor users can convert flight controller rates from one type to another

## how it works
enter your rates or rates of popular pilots to visually compare or automatically convert rates to your preferred fc software

## faq
* How do you know the rates are accurate? I don’t! I’ve entrusted our fate into the hands of the [betaflight configurator](https://github.com/betaflight/betaflight-configurator) devs. I borrowed their rate calculation file and gave it a new place to show off its curves. 
* how does the automatic rate conversion work? the api takes 10 datapoints of the source curve and uses non-linear least squares to find the best fit of the rate type you want.

## feature ideas
themes
incorporate the throttle slider

## todo
- [ ] mobile


## resources

### special thanks to these wonderful projects
* [betaflight configurator](https://github.com/betaflight/betaflight-configurator)
* [rotor pirates](https://github.com/apocolipse/RotorPirates)
* [rate fitter](https://github.com/yhgillet/rateconv/tree/8e9cc846f63971820bb77f1069e79271c08e2ff2)
* [rate tuner](https://github.com/Dadibom/Rate-Tuner/tree/de57d61d8307b29d8ac6a9a926aa719ddf3d605b)
* [desmos](https://www.desmos.com/calculator/r5pkxlxhtb?fbclid=IwAR0DfRnnfMaYSUXF5g7moEjfHlwCOi84iq9WMOUaOhVQwauY-ggFDh-KpSY)


## development setup(front end)

### requirements
* node
* npm

### process

1. navigate to /multirotor-rate-converter
2. install all of the required packages
```
npm install
```
3. run the express development server
```
npm run dev
```

## development setup(the whole shabang)

### requirements
* python
* venv
* pip

### process

1. navigate to /multirotor-rate-converter/rate-fitter  
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
5. launch the devServer.py
```
python3 devServer.py
```
6. if you have issues you may need to set environment variables  
```
export FLASK_APP=devServer
export FLASK_ENV=development
export FLASK_RUN_HOST=localhost
export FLASK_RUN_PORT=3000
```
NOTE: sometimes the browser likes to cache files so either use an incognito window or hard refresh every once in a while


## deploying to production
### front end
serve static files with nginx or whatever you prefer
### api
https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-20-04