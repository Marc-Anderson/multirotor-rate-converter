# multirotor-rate-converter

## description
a simple web app to visualize the difference and compare rates of flight controller software

## purpose
provide a place where multirotor users can convert any flight controller rates from one type to another

## how it works
visualize rates types from most of the popular flight controller software on the same chart so you can convert, compare or see the difference between different rate settings

## faq
How do you know the rates are accurate? I don’t! I’ve entrusted our fate into the hands of the betaflight configurator devs. I borrowed their rate calculation file and gave them in a new place to show off their curves. 

## development notes

### requirements
- [ ] scalable website


### feature ideas
show least squares
color coding?
highlight the last edited row?
light and dark theme similar to betaflight
incorporate the throttle slider?
a way to convert the rates types from one another automatically finding the best line

### todo
- [ ] finish readme
- [ ] add hide/disable option
- [ ] review scalabiliity
- [ ] make the ui fancy
- [ ] check out chart features
- [ ] organize chart.js
- [ ] review betaflight configurator changes to see if we can merge them
- [ ] delete row of data
- [ ] insert 


### resources

#### existing rate converters
* [rotor pirates](https://github.com/apocolipse/RotorPirates)
* [rate fitter](https://github.com/yhgillet/rateconv/tree/8e9cc846f63971820bb77f1069e79271c08e2ff2)
* [rate tuner](https://github.com/Dadibom/Rate-Tuner/tree/de57d61d8307b29d8ac6a9a926aa719ddf3d605b)
* [desmos](https://www.desmos.com/calculator/r5pkxlxhtb?fbclid=IwAR0DfRnnfMaYSUXF5g7moEjfHlwCOi84iq9WMOUaOhVQwauY-ggFDh-KpSY)
* [betaflight configurator](https://github.com/betaflight/betaflight-configurator)
