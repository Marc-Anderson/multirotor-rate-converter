/** @typedef {Object} RateCurve */
importScripts('../libraries/js/RateCurve.js');
/** @typedef {Object} RateDetails */
importScripts('global.js');
/**
 * converts an RC command to degrees per second.
 * 
 * @function
 * @name getRcCommandRawToDegreesPerSecond
 * @param {string} tgtRateType - The rate type to convert to
 * @param {number} rcCommand - The RC command to convert
 * @param {number} rate - The rate value
 * @param {number} rcRate - The RC rate value
 * @param {number} rcExpo - The RC expo value
 * @returns {number} - The converted value
 */
importScripts('curveCalculator.js');



/* ============================================================
    0. web worker
============================================================ */
/* #region || web worker */

self.onmessage = function ( e ) {
    const { messageId, srcRateType, tgtRateType, rate, rc_rate, rc_expo } = e.data;
    try {
        const fitData = gradientDescent( srcRateType, tgtRateType, [ rate, rc_rate, rc_expo ] );
        self.postMessage( { messageId, fitData } );
    } catch ( err ) {
        self.postMessage( { messageId, error: err.message || String( err ) } );
    }
};

/* #endregion || web worker */
/* ============================================================
    1. utilities
============================================================ */
/* #region || utilities */


/* #region || utilities */
/**
 * returns a value or array of values that is constrained between a minimum and maximum value
 * @overload
 * @param {number} value
 * @param {number} minValue
 * @param {number} maxValue
 * @returns {number}
 */
/**
 * @overload
 * @param {number[]} value
 * @param {number} minValue
 * @param {number} maxValue
 * @returns {number[]}
 */
function constrain(value, minValue, maxValue) {
    if (typeof value === 'number') {
        return Math.max(minValue, Math.min(value, maxValue));
    }
    return value.map(x => Math.max(minValue, Math.min(x, maxValue)));
}


/**
 * returns an array of evenly spaced numbers over a specified interval
 * @param {number} start
 * @param {number} stop
 * @param {number} [numPoints=50]
 * @param {boolean} [includeEndpoint=true]
 * @returns {number[]}
 */
function linspace(start, stop, numPoints = 50, includeEndpoint = true) {
    if (numPoints < 2) {
        return [start];
    }
    /** @type {number} */
    const step = (stop - start) / (includeEndpoint ? (numPoints - 1) : numPoints);
    return Array.from({ length: numPoints }, (_, i) => start + step * i);
}


/**
 * @typedef {{x: number, y: number}} Point
 */


/**
 * calcuates the mean squared error between two rate curves
 * @param {(number[]|{x: number, y: number}[])} sourceRateCurve
 * @param {(number[]|{x: number, y: number}[])} targetRateCurve
 * @returns {number}
 */
function calculateMSError( sourceRateCurve, targetRateCurve ) {

    if ( sourceRateCurve.length !== targetRateCurve.length || sourceRateCurve.length === 0) {
        throw new Error( 'line arrays must have the same length greater than zero' );
    }

    // convert object arrays to number arrays
    if((sourceRateCurve.length > 0 && typeof sourceRateCurve[0] === 'object' && 'x' in sourceRateCurve[0])) sourceRateCurve = sourceRateCurve.map( point => point.y)
    if((targetRateCurve.length > 0 && typeof targetRateCurve[0] === 'object' && 'x' in targetRateCurve[0])) targetRateCurve = targetRateCurve.map( point => point.y)

    // calculate mean squared error
    /** @type {number[]} */
    const differences = sourceRateCurve.map( ( value, index ) => value - Number(targetRateCurve[index]) );
    
    /** @type {number[]} */
    const squaredDifferences = differences.map( diff => diff * diff );
    
    /** @type {number} */
    const mse = squaredDifferences.reduce( ( sum, diff ) => sum + diff, 0 ) / sourceRateCurve.length;
    
    return mse;
}

// normalization and denormalization rates based on the maximum value

/**
 * 
 * @param {[number,number,number]} rateValues 
 * @param {string} tgtRateType 
 * @returns {[number,number,number]} - normalized rate values
 */
function normalizeParams(rateValues, tgtRateType) {
    
    /** @type {object} */
    const tgtRateReferenceData = rateDetails[tgtRateType]["rateValues"];
    
    /** @type {[number,number,number]} */
    const tgtRateMaxValues = [tgtRateReferenceData["rate"]["max"], tgtRateReferenceData["rc_rate"]["max"], tgtRateReferenceData["rc_expo"]["max"]]

    /** @type {number[]} */
    let normalizedParams = rateValues.map((rateValue, index) => rateValue / tgtRateMaxValues[index])

    return [normalizedParams[0], normalizedParams[1], normalizedParams[2]];
}

/**
 * 
 * @param {*} params normalized rate values
 * @param {*} tgtRateType 
 * @returns {[number,number,number]} rate values
 */
function denormalizeParams(params, tgtRateType) {
    /** @type {object} */
    const tgtRateReferenceData = rateDetails[tgtRateType]["rateValues"];
    
    /** @type {number[]} */
    const tgtRateMaxValues = [tgtRateReferenceData["rate"]["max"], tgtRateReferenceData["rc_rate"]["max"], tgtRateReferenceData["rc_expo"]["max"]]
    
    /** @type {number[]} */
    let denormalizedParams = params.map((param, index) => param * tgtRateMaxValues[index]);
    
    return [denormalizedParams[0], denormalizedParams[1], denormalizedParams[2]];
}

/* #endregion || utilities */
/* ============================================================
    2. gradient descent
============================================================ */
/* #region || gradient descent */


/**
 * @param {Point[]} srcRateCurve
 * @param {string} tgtRateType
 * @param {[number,number,number]} params normalized rate values
 * @returns {[number,number,number]} gradient for each rate value
 */
function calculateNumericGradients(srcRateCurve, tgtRateType, params, DELTA=1e-4) {

    /** @type {[number,number,number]} */
    let gradients = [0,0,0];

    for (let i = 0; i < params.length; i++) {
        let paramsPlus = params.slice();
        paramsPlus[i] += DELTA;

        let paramsMinus = params.slice();
        paramsMinus[i] -= DELTA;

        /** @type {number[]} */
        let plusTgtRateCurve = srcRateCurve.map(rcCommand => {
            /** @type {[number,number,number]} */
            const denormalizedParamsPlus = denormalizeParams(paramsPlus, tgtRateType)
            return getRcCommandRawToDegreesPerSecond(tgtRateType, rcCommand.x, ...denormalizedParamsPlus)
        });

        /** @type {number[]} */
        let minusTgtRateCurve = srcRateCurve.map(rcCommand => {
            /** @type {[number,number,number]} */
            const denormalizedParamsMinus = denormalizeParams(paramsMinus, tgtRateType)
            return getRcCommandRawToDegreesPerSecond(tgtRateType, rcCommand.x, ...denormalizedParamsMinus)
        });

        /** @type {number} */
        let gradient = (calculateMSError(srcRateCurve, plusTgtRateCurve) - calculateMSError(srcRateCurve, minusTgtRateCurve)) / (2 * DELTA);

        gradients[i] = gradient;
    }

    return gradients;
}



/**
 * @param {string} srcRateType
 * @param {string} tgtRateType
 * @param {[string,string,string]} srcRates
 * @returns 
 */
function gradientDescent(srcRateType, tgtRateType, srcRates){

    const CONFIG = {
        // number of data points to fit the curve
        NUM_RATE_CURVE_DATAPOINTS_TO_FIT: 501,
        // 
        GD_ITERATIONS: 1000,
        // exponential decay rate for first moment - lower values make optimizer more responsive to recent changes, higher values make it smoother
        BETA1: 0.9,
        // exponential decay rate for second moment - lower values make optimizer more responsive to recent changes, higher values make it smoother
        BETA2: 0.999,
        // 
        LEARNING_RATE: 15e-3,
        // learning rate decay per iteration
        LR_DECAY: 0.99,
        // adjust the learning rate for each rate parameter
        LEARNING_RATE_SCALES: [16e-2, 16e-2, 16e-1],
        // small constant to prevent division by zero
        EPSILON: 1e-5
    }

    // generate evenly spaced rcCommand values between 0 and 1
    /** @type {number[]} */
    const rcCommandfs = linspace(1500, 2001, CONFIG.NUM_RATE_CURVE_DATAPOINTS_TO_FIT);
    
    // initialize parameters
    /** @type {string} */
    const tgtRateReferenceData = rateDetails[tgtRateType]["rateValues"];
    /** @type {number} */
    let rate = tgtRateReferenceData["rate"]["default"]
    /** @type {number} */
    let rcRate = tgtRateReferenceData["rc_rate"]["default"]
    /** @type {number} */
    let rcExpo = tgtRateReferenceData["rc_expo"]["default"]
    /** @type {[number,number,number]} */
    let tgtRates = [rate, rcRate, rcExpo];

    /** @type {Point[]} the curve representing the source rate values */
    const sourceRateCurve = rcCommandfs.map(rcCommand => {
        return { x: rcCommand, y: getRcCommandRawToDegreesPerSecond(srcRateType, rcCommand, ...srcRates) };
    });

    /** @type {number[]} moving average of gradients (momentum) */
    let m = Array(tgtRates.length).fill(0);

    /** @type {number[]} moving average of squared gradients (scales learning rate) */
    let v = Array(tgtRates.length).fill(0);

    // process gradient descent for each iteration
    for (let i = 0; i < CONFIG.GD_ITERATIONS; i++) {

        /** @type {[number,number,number]} scale parameters to 0-1 for optimization */
        let params = normalizeParams([rate,rcRate,rcExpo], tgtRateType)

        /** @type {number[]} */
        let gradients = calculateNumericGradients(sourceRateCurve, tgtRateType, params);

        // apply bias correction for each moment
        m = m.map((mVal, index) => CONFIG.BETA1 * mVal + (1 - CONFIG.BETA1) * gradients[index]);
        v = v.map((vVal, index) => CONFIG.BETA2 * vVal + (1 - CONFIG.BETA2) * Math.pow(gradients[index], 2));

        /** @type {number[]} bias corrected moving average of gradients (momentum) */
        let mHat = m.map(mVal => mVal / (1 - Math.pow(CONFIG.BETA1, (i + 1))));

        /** @type {number[]} bias corrected moving average of squared gradients (scales learning rate) */
        let vHat = v.map(vVal => vVal / (1 - Math.pow(CONFIG.BETA2, (i + 1))));

        /** @type {number} */
        let decayedLearningRate = CONFIG.LEARNING_RATE * Math.pow(CONFIG.LR_DECAY, (i + 1));
        
        /** @type {number[]} */
        let cleanedparams = params.map((param, index) => param - decayedLearningRate * CONFIG.LEARNING_RATE_SCALES[index] * mHat[index] / (Math.sqrt(vHat[index]) + CONFIG.EPSILON));
        
        /** @type {[number,number,number]} */
        let predictedRates = denormalizeParams(cleanedparams, tgtRateType);

        // constrain the predicted rates to the min and max values
        rate = Math.min(Math.max(predictedRates[0], tgtRateReferenceData["rate"]["min"]), tgtRateReferenceData["rate"]["max"]);
        rcRate = Math.min(Math.max(predictedRates[1], tgtRateReferenceData["rc_rate"]["min"]), tgtRateReferenceData["rc_rate"]["max"]);
        rcExpo = Math.min(Math.max(predictedRates[2], tgtRateReferenceData["rc_expo"]["min"]), tgtRateReferenceData["rc_expo"]["max"]);

    }

    const targetRateCurve = rcCommandfs.map(rcCommand => {
        return { x: rcCommand, y: getRcCommandRawToDegreesPerSecond(tgtRateType, rcCommand, rate, rcRate, rcExpo) };
    });

    let formatted_rate, formatted_rc_rate, formatted_rc_expo;
    if (tgtRateType === "raceflight" || tgtRateType === "inavflight") {
        formatted_rate = Math.ceil(rate);
        formatted_rc_rate = Math.ceil(rcRate);
        formatted_rc_expo = Math.ceil(rcExpo);
    } else if (tgtRateType === "actual") {
        formatted_rate = Math.ceil(rate);
        formatted_rc_rate = Math.ceil(rcRate);
        formatted_rc_expo = rcExpo.toFixed(2);
    } else if (tgtRateType === "quickrates") {
        formatted_rate = Math.ceil(rate);
        formatted_rc_rate = rcRate.toFixed(2);
        formatted_rc_expo = rcExpo.toFixed(2);
    } else {
        formatted_rate = rate.toFixed(2);
        formatted_rc_rate = rcRate.toFixed(2);
        formatted_rc_expo = rcExpo.toFixed(2);
    }

    const best_fit_object = {
        "srcRateType": srcRateType,
        "src_rate": srcRates[0],
        "src_rc_rate": srcRates[1],
        "src_rc_expo": srcRates[2],
        "source_data": sourceRateCurve,
        "tgtRateType": tgtRateType,
        "tgt_rate": `${formatted_rate}`,
        "tgt_rc_rate": `${formatted_rc_rate}`,
        "tgt_rc_expo": `${formatted_rc_expo}`,
        "target_data": targetRateCurve
    };

    // console.log(best_fit_object.tgt_rate, best_fit_object.tgt_rc_rate, best_fit_object.tgt_rc_expo);

    return best_fit_object
}
// gradientDescent(source_rate_type, target_rate_type, source_rates)
/* #endregion || gradient descent */