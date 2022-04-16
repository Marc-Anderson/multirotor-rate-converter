// global references, some for required from betaflight configurator

// bypass various boolean operations
let useLegacyCurve = false;

// bypass versioning
let API_VERSION_1_43 = "1.43"
let semver = {
    gte: (test, actual) => test == actual
}

// create a mock flight controller
let FC = {}
FC.CONFIG = {}
FC.CONFIG.apiVersion = "1.43.0";

// betaflight configurator global references
let TABS = {};
TABS.pid_tuning = {
    currentRates: {
        deadband: 0,
        pitch_rate: 0.7,
        pitch_rate_limit: 1998,
        rc_expo: 0.5,
        rc_pitch_expo: 0.5,
        rc_rate: 1,
        rc_rate_pitch: 1,
        rc_rate_yaw: 1,
        rc_yaw_expo: 0.5,
        roll_rate: 0.7,
        roll_rate_limit: 1998,
        superexpo: true,
        yawDeadband: 0,
        yaw_rate: 0.7,
        yaw_rate_limit: 1998
    },
    currentRateProfile: null,
    currentRatesType: null,
    previousRatesType: null,
    RATES_TYPE: {
        BETAFLIGHT: 0,
        RACEFLIGHT: 1,
        KISS: 2,
        ACTUAL: 3,
        QUICKRATES: 4,
    }
};

// create a ratecurve 
TABS.pid_tuning.rateCurve = new RateCurve(useLegacyCurve);

// as it sounds
let rateTableGroupCounter = 0;


const colors = [
    '255,61,2',
    '77,209,33',
    '41,63,255',
    '232,203,14',
    '177,61,255',
    // '255,0,41',
    // '102,166,30',
    // '55,126,184',
    '255,127,0',
    '152,78,163',
    '0,210,213',
    '175,141,0',
    '127,128,205',
    '179,233,0',
    '196,46,96',
    '166,86,40',
    '247,129,191',
    '141,211,199',
    '190,186,218',
    '251,128,114',
    '128,177,211'
]

// names, limits and default values for rate types
let rateDetails = [
    {
        name: "BETAFLIGHT",
        rc_rate: {
            title: "RC Rate",
            step: 0.01,
            min: 0.01,
            max: 2.55,
            default: 1.00
        },
        roll_rate: {
            title: "Rate",
            step: 0.01,
            min: 0.00,
            max: 1.00,
            default: 0.70
        },
        rc_expo: {
            title: "RC Expo",
            step: 0.01,
            min: 0.00,
            max: 1.00,
            default: 0.50
        },
    },
    {
        name: "RACEFLIGHT",
        rc_rate: {
            title: "Rate",
            step: 10,
            min: 10,
            max: 2000,
            default: 370
        },
        roll_rate: {
            title: "Acro+",
            step: 1,
            min: 0,
            max: 255,
            default: 80
        },
        rc_expo: {
            title: "Expo",
            step: 1,
            min: 0,
            max: 100,
            default: 50
        },
    },
    {
        name: "KISS",
        rc_rate: {
            title: "RC Rate",
            step: 0.01,
            min: 0.01,
            max: 2.55,
            default: 1.00
        },
        roll_rate: {
            title: "Rate",
            step: 0.01,
            min: 0.00,
            max: 0.99,
            default: 0.70
        },
        rc_expo: {
            title: "RC Curve",
            step: 0.01,
            min: 0.00,
            max: 1.00,
            default: 0.00
        },
    },
    {
        name: "ACTUAL",
        rc_rate: {
            title: "Center Sensitivity",
            step: 10,
            min: 10,
            max: 2000,
            default: 200
        },
        roll_rate: {
            title: "Max Rate",
            step: 10,
            min: 0,
            max: 2000,
            default: 670
        },
        rc_expo: {
            title: "Expo",
            step: 0.01,
            min: 0.00,
            max: 1.00,
            default: 0.54
        },
    },
    {
        name: "QUICKRATES",
        rc_rate: {
            title: "RC Rate",
            step: 0.01,
            min: 0.01,
            max: 2.55,
            default: 1.00
        },
        roll_rate: {
            title: "Max Rate",
            step: 10,
            min: 0,
            max: 2000,
            default: 670
        },
        rc_expo: {
            title: "Expo",
            step: 0.01,
            min: 0.00,
            max: 1.00,
            default: 0.00
        },
    }
]