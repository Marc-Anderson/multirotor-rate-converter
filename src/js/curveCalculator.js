// return the value for any curve at a given point
function getRcCommandRawToDegreesPerSecond(ratesType, rcData, rate, rcRate, rcExpo){

    if(Object.values(TABS.pid_tuning.RATES_TYPE).find( x => x == ratesType) == undefined) return
    
    TABS.pid_tuning.currentRatesType = parseFloat(ratesType)

    rate = parseFloat(rate)
    rcRate = parseFloat(rcRate)
    rcExpo = parseFloat(rcExpo)

    let superExpoActive = true
    let deadband = 0
    let limit = 1998

    let anglerate = TABS.pid_tuning.rateCurve.rcCommandRawToDegreesPerSecond(rcData, rate, rcRate, rcExpo, superExpoActive, deadband, limit)

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