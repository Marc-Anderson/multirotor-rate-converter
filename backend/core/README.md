# Multirotor Rate Converter Core


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
2. **Local Gradient Descent:** This method uses 500 data points and Mean Squared Error (MSE) to identify the best fit. You will need visit the live site or download the ui to use this. 

### Why are there two calculation methods?
The on-device gradient descent calculation was developed as a proof of concept to potentially reduce monthly server costs. However, the API-based calculation is faster and the max rate is generally more accurate to the input.

## Feature Ideas
- 

## Todo
- [ ] Implement tests for all functionalities.


## Resources

### Special Thanks To These Wonderful Projects
- [Betaflight Configurator](https://github.com/betaflight/betaflight-configurator)
- [Rotor Pirates](https://github.com/apocolipse/RotorPirates)
- [Rate Fitter](https://github.com/yhgillet/rateconv/tree/8e9cc846f63971820bb77f1069e79271c08e2ff2)
- [Rate Tuner](https://github.com/Dadibom/Rate-Tuner/tree/de57d61d8307b29d8ac6a9a926aa719ddf3d605b)
- [Desmos](https://www.desmos.com/calculator/r5pkxlxhtb?fbclid=IwAR0DfRnnfMaYSUXF5g7moEjfHlwCOi84iq9WMOUaOhVQwauY-ggFDh-KpSY)



# Development: Python

For local testing, you can run the project as a module directly using the provided tests

## Prerequisites
- python3.8
- virtual environment (`venv`)
- pip


## Setup

#### 1. download or clone this repository

if you dont have git installed you can visit [this link to the repo](https://github.com/Marc-Anderson/multirotor-rate-converter-core.git) and download the zip file by clicking `code` > `download zip`

```sh
git clone https://github.com/Marc-Anderson/multirotor-rate-converter-core.git
```

#### 2. navigate to the project directory
```sh
cd multirotor-rate-converter-core
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
pip3 install .
```


#### 6. import `getFitValues` from module and use it
```py
from multirotor_rate_converter.core import getFitValues

result = getFitValues(srcRateType, tgtRateType, src_rate, src_rc_rate, src_rc_expo)
```


## testing

test cases include all valid rate conversions on the website between october 2024 and april 2025. 

#### 1. install requests
```sh
pip3 install requests
```

#### 2. run the tests
```sh
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

