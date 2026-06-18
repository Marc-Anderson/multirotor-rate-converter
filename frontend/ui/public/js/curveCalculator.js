// return the value for any curve at a given point
function getRcCommandRawToDegreesPerSecond(ratesType, rcData, rate, rcRate, rcExpo){

    if(Object.keys(rateDetails).find( x => x == ratesType) == undefined) return
    
    FC.RC_TUNING.rates_type = parseFloat(rateDetails[ratesType].id)

    rate = parseFloat(rate)
    rcRate = parseFloat(rcRate)
    rcExpo = parseFloat(rcExpo)

    if (ratesType == 'inavflight') {
        // console.log("Using INAV rates calculation with parameters:", rcData, rate, rcRate, rcExpo);
        return getINAVRates(rcData, rate, rcRate, rcExpo)
    }

    let superExpoActive = true
    let deadband = 0
    let limit = 1998

    let anglerate = FC.RC_TUNING.rateCurve.rcCommandRawToDegreesPerSecond(rcData, rate, rcRate, rcExpo, superExpoActive, deadband, limit)

    return anglerate
}

// generate an array of points for a given curve
function generateCurve(ratesType, rate, rcRate, rcExpo){

    let curve = []
    let rcValue = 1500;
    let rcMax = 2001

    while(rcValue < rcMax){
        curve.push(getRcCommandRawToDegreesPerSecond(ratesType, rcValue, rate, rcRate, rcExpo))
        rcValue++
    }
    return curve
    
}


// disabled since conversion api
// the sum difference between 2 arrays
// function sumCurveDifference ( dataSetOne, dataSetTwo ) {
//     let sumDiff = dataSetOne.reduce( ( previousValue, currentValue, index ) => {
//         return previousValue + Math.abs( currentValue - dataSetTwo[ index ] )
//     }, 0 )
//     return sumDiff
// }

function getINAVRates(rcCommandf, rate, rcRate, rcExpo) {
    /**
     * INAV rates (degrees/second).
     *
     * rcCommandf : raw input in 1000–2000
     * rate       : "Max Rate" in degrees per second
     * rcRate     : unused
     * rcExpo     : "Expo" from 0 to 1
     */

    // this calculation is based on a kind redditor and their desmos calculator:
    //https://www.desmos.com/calculator/7ph8s3vbhp
    //https://www.reddit.com/r/Multicopter/comments/1isj05g/updated_graphing_calculator_added_inav_rates/

    // Convert raw RC value (1000–2000) to INAV stick deflection range [-500, 500]
    const stickDeflection = rcCommandf - 1500;

    // Convert expo from [0, 1] range to [0, 100] like INAV expects
    const expoPercent = rcExpo;
    // const expoPercent = rcExpo * 100.0;

    // Convert deflection to -5.0 to 5.0 range
    const tmpf = stickDeflection / 100.0;

    // Reproduce INAV internal rate calculation
    const rateCmd = ((2500.0 + expoPercent * (tmpf * tmpf - 25.0)) * tmpf) / 25.0;

    // Convert to degrees per second by scaling with Max Rate (rate)
    return (rateCmd / 500.0) * rate;
}
