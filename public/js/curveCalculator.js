// return the value for any curve at a given point
function getRcCommandRawToDegreesPerSecond(ratesType, rcData, rate, rcRate, rcExpo){

    if(Object.keys(rateDetails).find( x => x == ratesType) == undefined) return
    
    FC.RC_TUNING.rates_type = parseFloat(rateDetails[ratesType].id)

    rate = parseFloat(rate)
    rcRate = parseFloat(rcRate)
    rcExpo = parseFloat(rcExpo)

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