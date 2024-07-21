String.prototype.toSentenceCase = function(){
    return `${this.split("",1)[0].toUpperCase()}${this.substring(1).toLowerCase()}`
}


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