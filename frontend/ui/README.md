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
2. **Local Gradient Descent:** This method uses 500 data points and Mean Squared Error (MSE) to identify the best fit locally on the users device. This fit method is available in this repository

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
- python


## Setup

#### 1. download or clone this repository

if you dont have git installed you can visit [this link to the repo](https://github.com/Marc-Anderson/multirotor-rate-converter-ui.git) and download the zip file by clicking `code` > `download zip`

```sh
git clone https://github.com/Marc-Anderson/multirotor-rate-converter-ui.git
```

#### 2. navigate to the project directory
```sh
cd multirotor-rate-converter-ui
```

#### 3. start the python dev server:
```sh
python3 -m http.server 3000 --directory public
```

#### 4. visit the application in your browser at `localhost:3000`.

**Note:** to avoid issues with browser caching, use an incognito window or perform a hard refresh occasionally.

