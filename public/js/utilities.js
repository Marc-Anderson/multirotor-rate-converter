String.prototype.toSentenceCase = function(){
    return `${this.split("",1)[0].toUpperCase()}${this.substring(1).toLowerCase()}`
}

// experimental - untested
Number.prototype.countDecimalPlaces = function(){
    if(Math.floor(this) === this) return 0;
    return this.toString().split(".")[1].length || 0;
}

function countDecimalPlaces(value){
    if(isNaN(value / 1)) return
    if(Math.floor(value) === value) return 0;
    return value.toString().split(".")[1].length || 0;
}

// given a range, return the percentage value of a different range(i.e. in 50 in a scale of 0-100 is .5 in a scale from 0-1 when stepping by 0.1)
function findValueInScale(sourceMin, sourceMax, sourceCurrentValue, targetMin, targetMax, targetStep = .1) {
    [...arguments].forEach(arg => {
        if(isNaN(arg / 1)){
            console.log("invalid field")
            return
        }
    })
    let value = ((sourceCurrentValue - sourceMin) / ((sourceMax - sourceMin) / ((targetMax - targetMin) / targetStep))) * targetStep + targetMin
    if(value > targetMax) return targetMax
    if(value < targetMin) return targetMin
    return value.toFixed(targetStep.countDecimalPlaces())
}
findValueInScale(0, 100, 50, 0, 1, .1)
