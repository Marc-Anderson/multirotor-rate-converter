# Multirotor Rate Converter (BETA)

Experience it live [here](https://rates.metamarc.com/dev).

## Purpose

The Multirotor Rate Converter provides an essential tool for multirotor enthusiasts, enabling them to convert flight controller (FC) rates from one type to another seamlessly. This platform aims to simplify the process of rate conversion, enhancing the user experience for pilots migrating to a new platform.

## How It Works

Users can input their own rates or the rates of popular pilots to visually compare and automatically convert them to their preferred FC software. This tool supports various FC rate formats, ensuring accurate conversions and easy comparisons.

## Frequently Asked Questions (FAQ)

### How do you ensure the accuracy of the rates?

The accuracy of the rates is guaranteed through the use of the rate calculation file from the [Betaflight Configurator](https://github.com/betaflight/betaflight-configurator). This ensures that the conversions adhere to the standards and calculations used by one of the most trusted sources in the industry.

### How does the automatic rate conversion work?

In this latest version, the conversion process involves taking 500 data points from the provided source rates. A JavaScript implementation of gradient descent is then used to calculate the best fit for the target rate type. The error, also known as the total delta, is determined by calculating the mean squared error (MSE) between data points from both curves at each RC command value.

### Is an API required for the conversion process?

No, this version performs all calculations directly on the device, eliminating the need for an external API. This on-device processing enhances reliability and speed, ensuring that users can perform conversions even without internet access.

## Feature Ideas

- **Themes**: Customize the appearance of the converter to suit personal preferences.
- **Throttle Slider Integration**: Incorporate a throttle slider for more interactive rate adjustments.

## To-Do List

- [ ] Mobile Compatibility: Enhance the platform to ensure full functionality and a seamless user experience on mobile devices.

## Resources

### Special Thanks to These Wonderful Projects

- [Betaflight Configurator](https://github.com/betaflight/betaflight-configurator)
- [Rotor Pirates](https://github.com/apocolipse/RotorPirates)
- [Rate Fitter](https://github.com/yhgillet/rateconv/tree/8e9cc846f63971820bb77f1069e79271c08e2ff2)
- [Rate Tuner](https://github.com/Dadibom/Rate-Tuner/tree/de57d61d8307b29d8ac6a9a926aa719ddf3d605b)
- [Desmos Calculator](https://www.desmos.com/calculator/r5pkxlxhtb?fbclid=IwAR0DfRnnfMaYSUXF5g7moEjfHlwCOi84iq9WMOUaOhVQwauY-ggFDh-KpSY)

## Development Setup

### Requirements

- A web server capable of hosting static files.

### Process

To set up the development environment, simply host the static files on a web server. This straightforward setup ensures that the application can be accessed and used with minimal configuration.