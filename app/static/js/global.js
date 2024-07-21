// global references, some for required from betaflight configurator

// bypass various boolean operations
let useLegacyCurve = false;

// bypass versioning
let API_VERSION_1_43 = "1.43"
let semver = {
    gte: (current, test) => parseInt(current) >= parseInt(test)
}

// create a mock flight controller and configurator global references
const FC = {
    CONFIG: {
        apiVersion: "1.43.0"
    },
    RC_TUNING: {
        rates_type: 0,
        roll_rate: 0.7,
        pitch_rate: 0.7,
        yaw_rate: 0.7,
        RC_RATE: 1,
        rcYawRate: 1,
        RC_EXPO: 0.5,
        RC_YAW_EXPO: 0.5,
        rcPitchRate: 1,
        RC_PITCH_EXPO: 0.5,
        roll_rate_limit: 1998,
        pitch_rate_limit: 1998,
        yaw_rate_limit: 1998
        // superexpo: true,
    },
    RC_DEADBAND_CONFIG: {
        deadband: 0,
        yaw_deadband: 0
    },
    FEATURE_CONFIG: {
        features: {
            isEnabled: (feature) => {
                if(FC.FEATURE_CONFIG.features.activeFeatures.includes(feature)){
                    return true
                } else {
                    return false
                }
            },
            activeFeatures: ['SUPEREXPO_RATES']
        }
    },
    RATES_TYPE: {
        BETAFLIGHT: 0,
        RACEFLIGHT: 1,
        KISS: 2,
        ACTUAL: 3,
        QUICKRATES: 4,
    }
}

// create a ratecurve 
FC.RC_TUNING.rateCurve = new RateCurve(useLegacyCurve);

// as it sounds
let rateTableGroupCounter = 0;


const colors = [
    'rgba(0,210,213)',
    'rgba(127,128,205)',
    'rgba(255,61,2)',
    'rgba(77,209,33)',
    'rgba(41,63,255)',
    'rgba(232,203,14)',
    'rgba(177,61,255)',
    'rgba(255,127,0)',
    'rgba(152,78,163)',
    'rgba(175,141,0)',
    'rgba(179,233,0)',
    'rgba(196,46,96)',
    'rgba(166,86,40)',
    'rgba(247,129,191)',
    'rgba(141,211,199)',
    'rgba(190,186,218)',
    'rgba(251,128,114)',
    'rgba(128,177,211)'
]

// names, limits and default values for rate types
let rateDetails = {
    "betaflight": {
        "id": "0",
        "label": "Betaflight",
        "backgroundColor": "rgb(255,61,2)",
        "borderColor": "rgb(255,61,2)",
        "rateValues": {
            "rc_rate": {
                "title": "RC Rate",
                "step": 0.01,
                "min": 0.01,
                "max": 2.55,
                "default": 1.00
            },
            "rate": {
                "title": "Rate",
                "step": 0.01,
                "min": 0.00,
                "max": 1.00,
                "default": 0.70
            },
            "rc_expo": {
                "title": "RC Expo",
                "step": 0.01,
                "min": 0.00,
                "max": 1.00,
                "default": 0.00
            }
        }
    },
    "raceflight": {
        "id": "1",
        "label": "Raceflight",
        "backgroundColor": "rgb(77,209,33)",
        "borderColor": "rgb(77,209,33)",
        "rateValues": {
            "rc_rate": {
                "title": "Rate",
                "step": 10,
                "min": 10,
                "max": 2000,
                "default": 370
            },
            "rate": {
                "title": "Acro+",
                "step": 1,
                "min": 0,
                "max": 255,
                "default": 80
            },
            "rc_expo": {
                "title": "Expo",
                "step": 1,
                "min": 0,
                "max": 100,
                "default": 50
            }
        }
    },
    "kiss": {
        "id": "2",
        "label": "Kiss",
        "backgroundColor": "rgb(41,63,255)",
        "borderColor": "rgb(41,63,255)",
        "rateValues": {
            "rc_rate": {
                "title": "RC Rate",
                "step": 0.01,
                "min": 0.01,
                "max": 2.55,
                "default": 1.00
            },
            "rate": {
                "title": "Rate",
                "step": 0.01,
                "min": 0.00,
                "max": 0.99,
                "default": 0.70
            },
            "rc_expo": {
                "title": "RC Curve",
                "step": 0.01,
                "min": 0.00,
                "max": 1.00,
                "default": 0.00
            }
        }
    },
    "actual": {
        "id": "3",
        "label": "Actual",
        "backgroundColor": "rgb(232,203,14)",
        "borderColor": "rgb(232,203,14)",
        "rateValues": {
            "rc_rate": {
                "title": "Center Sensitivity",
                "step": 10,
                "min": 10,
                "max": 2000,
                "default": 70
            },
            "rate": {
                "title": "Max Rate",
                "step": 10,
                "min": 0,
                "max": 2000,
                "default": 670
            },
            "rc_expo": {
                "title": "Expo",
                "step": 0.01,
                "min": 0.00,
                "max": 1.00,
                "default": 0.00
            }
        }
    },
    "quickrates": {
        "id": "4",
        "label": "Quickrates",
        "backgroundColor": "rgb(177,61,255)",
        "borderColor": "rgb(177,61,255)",
        "rateValues": {
            "rc_rate": {
                "title": "RC Rate",
                "step": 0.01,
                "min": 0.01,
                "max": 2.55,
                "default": 1.00
            },
            "rate": {
                "title": "Max Rate",
                "step": 10,
                "min": 0,
                "max": 2000,
                "default": 670
            },
            "rc_expo": {
                "title": "Expo",
                "step": 0.01,
                "min": 0.00,
                "max": 1.00,
                "default": 0.00
            }
        }
    }
}