window.addEventListener('load', () => {

    init()

})

function init(){

    generateRateTableGroup()
    generateRateTableGroup('actual')
   
}

function monitorChanges(e){
    if(e.target.selectedIndex == undefined){

        let rateType = Object.keys(rateDetails).filter(type => {
            return rateDetails[type].id == e.currentTarget.querySelector('.ratetype-selector').selectedIndex;
        })[0]
        if(parseFloat(e.target.value) < rateDetails[rateType].rateValues[e.target.name].min) return
        if(parseFloat(e.target.value) > rateDetails[rateType].rateValues[e.target.name].max) return

        updateDatasetFromHTML(this.dataset.id)

        let slider = document.getElementById('rateSlider')
            slider.value = e.target.value

    } else {
        toggleActiveRow(this.dataset.id)
        updateRateTableGroupType(this.dataset.id)
        updateDatasetFromHTML(this.dataset.id)
    }
}

function updateRateTableGroupType(datasetID){
    
    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${datasetID}"]`)
    
    let rateType = Object.keys(rateDetails).filter(type => {
        return rateDetails[type].id == rateTableGroup.querySelector('.ratetype-selector').selectedIndex;
    })[0]

    let rc_rate_title = rateTableGroup.querySelector('.data-cell.rc_rate .data-cell-title')
        rc_rate_title.textContent = rateDetails[rateType].rateValues.rc_rate.title

    let rate_title = rateTableGroup.querySelector('.data-cell.rate .data-cell-title')
        rate_title.textContent = rateDetails[rateType].rateValues.rate.title

    let expo_title = rateTableGroup.querySelector('.data-cell.rc_expo .data-cell-title')
        expo_title.textContent = rateDetails[rateType].rateValues.rc_expo.title
    
    let rc_rate_e = rateTableGroup.querySelector('input[name="rc_rate"]')
        rc_rate_e.step = rateDetails[rateType].rateValues.rc_rate.step
        rc_rate_e.min = rateDetails[rateType].rateValues.rc_rate.min
        rc_rate_e.max = rateDetails[rateType].rateValues.rc_rate.max
        rc_rate_e.value = rateDetails[rateType].rateValues.rc_rate.default

    let rate_e = rateTableGroup.querySelector('input[name="rate"]')
        rate_e.step = rateDetails[rateType].rateValues.rate.step
        rate_e.min = rateDetails[rateType].rateValues.rate.min
        rate_e.max = rateDetails[rateType].rateValues.rate.max
        rate_e.value = rateDetails[rateType].rateValues.rate.default

    let rc_expo_e = rateTableGroup.querySelector('input[name="rc_expo"]')
        rc_expo_e.step = rateDetails[rateType].rateValues.rc_expo.step
        rc_expo_e.min = rateDetails[rateType].rateValues.rc_expo.min
        rc_expo_e.max = rateDetails[rateType].rateValues.rc_expo.max
        rc_expo_e.value = rateDetails[rateType].rateValues.rc_expo.default

    let targetDataset = currentData.datasets.find(dataset => dataset.id == datasetID)
        targetDataset.rates.rate = rateDetails[rateType].rateValues.rate.default
        targetDataset.rates.rc_rate = rateDetails[rateType].rateValues.rc_rate.default
        targetDataset.rates.rc_expo = rateDetails[rateType].rateValues.rc_expo.default
        targetDataset.label = rateDetails[rateType].label
        
}


function generateRateTableGroup(targetRateType = "betaflight"){

    if(colors.length < 1) {
        window.alert("Sorry, you've reached the limit. wtf are you using so many anyway.")
        return
    }

    let rateTable = document.getElementById('ratetable')
    let rateTableGroupTemplate = document.getElementById('ratetable-group-template').content
    let newRateTableGroup = rateTableGroupTemplate.cloneNode(true).firstElementChild

    let rateTypeTitles = Object.keys(rateDetails)

    rateTypeTitles.forEach(rateType => {
        let rateTypeSelect = document.createElement('option')
        rateTypeSelect.textContent = rateDetails[rateType].label
        rateTypeSelect.value = rateDetails[rateType].id
        newRateTableGroup.querySelector('.ratetype-selector').append(rateTypeSelect)
    })
   
    let rateTypeID = rateDetails[targetRateType.toLowerCase()].id
    newRateTableGroup.querySelector('.ratetype-selector').selectedIndex = rateTypeID

    // TODO: createdataset generates dataset & ratetable ids, move this somewhere more elegant
    newRateTableGroup.dataset.id = createDataset(targetRateType)

    let targetDataset = currentData.datasets.find(dataset => dataset.id == newRateTableGroup.dataset.id)

    rateTable.append(newRateTableGroup)

    newRateTableGroup.style.boxShadow = `-4px 0px 0px 0px ${targetDataset.backgroundColor}`
    newRateTableGroup.style.setProperty('--ratetable-bg-color', targetDataset.backgroundColor.replace(")", ", 0.5)"));    

    newRateTableGroup.addEventListener('input', monitorChanges)
    newRateTableGroup.addEventListener('focusin', sliderMonitor)
    newRateTableGroup.addEventListener('focusout', sliderMonitor)
    
    // let deleteButton = newRateTableGroup.querySelector('.ratetable-delete')
    // deleteButton.addEventListener('click', handleDeleteRateTableGroup, {once: true})

    function handleDeleteRateTableGroup(e){
        let datasetID = e.target.closest('.ratetable-group').dataset.id
        deleteRateTableGroup(datasetID)
    }

    // TODO: maybe move these away
    updateRateTableGroupType(targetDataset.id)
    updateDatasetFromHTML(targetDataset.id)

}
    
function updateDatasetFromHTML(datasetID){

    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${datasetID}"]`)

    let targetDataset = currentData.datasets.find(dataset => dataset.id == datasetID)

    targetDataset.rates.rate = rateTableGroup.querySelector('input[name="rate"]').value
    targetDataset.rates.rc_rate = rateTableGroup.querySelector('input[name="rc_rate"]').value
    targetDataset.rates.rc_expo = rateTableGroup.querySelector('input[name="rc_expo"]').value
    
    targetDataset.rates.max = getRateTableGroupMaxAngularVel(datasetID)
    rateTableGroup.querySelector('.maxAngularVel').value = targetDataset.rates.max

    targetDataset.data = generateCurve(targetDataset.label.toLowerCase(), targetDataset.rates.rate, targetDataset.rates.rc_rate, targetDataset.rates.rc_expo)

    // todo: implement mse error
    let totalDeltaElement = document.querySelector(`.totalDelta`)

    try {
        totalDeltaElement.value = calculateMSError(currentData.datasets[0].data, currentData.datasets[1].data).toFixed(2);
    } catch (error) {
        totalDeltaElement.value = 0;
    }
  

    rateChart.update()

}

function getRateTableGroupMaxAngularVel(datasetID){

    let targetDataset = currentData.datasets.find(dataset => dataset.id == datasetID)

    let ratesType = targetDataset.label.toLowerCase()
    let rate = targetDataset.rates.rate
    let rcRate = targetDataset.rates.rc_rate
    let rcExpo = targetDataset.rates.rc_expo
    
    let rcMax = 2001

    return Math.round((getRcCommandRawToDegreesPerSecond(ratesType, rcMax, rate, rcRate, rcExpo)))
    
}


let toggleActiveRow = (datasetID) => {

    let rateTableGroups = document.querySelectorAll('.ratetable-group')

    document.querySelector(':root').style.setProperty('--slider-color', currentData.datasets.find(dataset => dataset.id == datasetID).backgroundColor)   

    rateTableGroups.forEach(rateTableGroup => {
        if(rateTableGroup.dataset.id == datasetID){
            rateTableGroup.classList.add('active')
        } else {
            rateTableGroup.classList.remove('active')
        }
    })
}

function sliderMonitor(e){
    
    if(e.target.classList.contains('ratetype-selector')) return

    if(e.type == 'focusin'){
        toggleActiveRow(e.target.closest('.ratetable-group').dataset.id)
    }

    let slider = document.getElementById('rateSlider')
        slider.min = e.target.min
        slider.max = e.target.max
        slider.step = e.target.step
        slider.value = e.target.value

    slider.oninput = function () {
        e.target.value = this.value
        updateDatasetFromHTML(e.target.closest('.ratetable-group').dataset.id)
    }

}

function deleteRateTableGroup(datasetID){

    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${datasetID}"]`)

    rateTableGroup.remove('input', monitorChanges)
    rateTableGroup.remove('focusin', sliderMonitor)
    rateTableGroup.remove('focusout', sliderMonitor)
    let deleteButton = rateTableGroup.querySelector('.ratetable-delete')
        deleteButton.remove('click', deleteRateTableGroup)

    let targetDataset = currentData.datasets.find(dataset => dataset.id == datasetID)

    colors.push(targetDataset.backgroundColor)
    
    currentData.datasets.splice(currentData.datasets.indexOf(targetDataset),1)

    rateTableGroup.remove()
    rateChart.update()
    
}

function convertRates(event) {
    if(event.target.classList.contains('convert-btn')){
        if(event.target.classList.contains('rainbow')){
            return
        }
        if(event.target.classList.contains('legacy')){
            LegacyConvertRates(event)
        } else {
            LocalConvertRates(event)
        }
    }

}

function LegacyConvertRates(event){

    document.querySelectorAll('.convert-btn').forEach(btn => btn.classList.add('rainbow'))

    let datasetID = event.target.closest('.ratetable-group').dataset.id

    toggleActiveRow(datasetID)

    let sourceDataset = currentData.datasets.find(dataset => dataset.id == datasetID)

    let srcRateType = sourceDataset.label.toLowerCase()
    let rate = sourceDataset.rates.rate
    let rc_rate = sourceDataset.rates.rc_rate
    let rc_expo = sourceDataset.rates.rc_expo

    let apiTrackingObject = {
        event: "convert_rates",
        srcRateType: srcRateType,
        rate: rate,
        rc_rate: rc_rate,
        rc_expo: rc_expo,
        tgtRateTypes: []
    }

    let targetRateTypes = new Set(currentData.datasets.map(dataset => dataset.label.toLowerCase()))

    targetRateTypes.forEach(currentRateType => {
        if(currentRateType !== srcRateType){
            apiTrackingObject.tgtRateTypes.push(currentRateType)
            let requestData = `srcRateType=${srcRateType}&rate=${rate}&rc_rate=${rc_rate}&rc_expo=${rc_expo}&tgtRateType=${currentRateType}`
            fetch(`${window.location.href}api?${requestData}`)
                .then(response => response.json())
                .then(data => {
                    if(data.request_status === "failed"){
                        console.log(`invalid api request - ${data.errors[0]}`)
                    } else {
                        currentData.datasets.forEach(dataset => {
                            if(dataset.label.toLowerCase() == data.tgtRateType){
                                let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${dataset.id}"]`)
                                rateTableGroup.querySelector('input[name="rate"]').value = data.tgt_rate
                                rateTableGroup.querySelector('input[name="rc_rate"]').value = data.tgt_rc_rate
                                rateTableGroup.querySelector('input[name="rc_expo"]').value = data.tgt_rc_expo
                                rateTableGroup.querySelector('.convert-btn')?.classList.remove('rainbow')
                                updateDatasetFromHTML(dataset.id)
                            }
                        })
                    }
                });
        } else {
            setTimeout(() => {
                document.querySelectorAll('.convert-btn').forEach(btn => btn.classList.remove('rainbow'))
                dataLayer?.push(apiTrackingObject)
            }, 1000);
        }
    
    })
}


function LocalConvertRates(event){
    
    document.querySelector('.convert-btn').classList.add('rainbow')
    
    // let datasetID = event.target.closest('.ratetable-group').dataset.id
    let datasetID = 0

    // toggleActiveRow(datasetID)

    let sourceDataset = currentData.datasets.find(dataset => dataset.id == datasetID)

    let srcRateType = sourceDataset.label.toLowerCase()
    let rate = sourceDataset.rates.rate
    let rc_rate = sourceDataset.rates.rc_rate
    let rc_expo = sourceDataset.rates.rc_expo

    let apiTrackingObject = {
        event: "convert_rates_local",
        srcRateType: srcRateType,
        rate: rate,
        rc_rate: rc_rate,
        rc_expo: rc_expo,
        tgtRateTypes: []
    }

    let targetRateTypes = new Set(currentData.datasets.map(dataset => dataset.label.toLowerCase()))

    targetRateTypes.forEach(currentRateType => {
        if(currentRateType !== srcRateType){
            
            apiTrackingObject.tgtRateTypes.push(currentRateType)

            /** @type {object} */
            let fit_data = gradientDescent(srcRateType, currentRateType, [rate, rc_rate, rc_expo]);
            currentData.datasets.forEach(dataset => {
                if(dataset.label.toLowerCase() == fit_data.tgtRateType){
                    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${dataset.id}"]`)

                    rateTableGroup.querySelector('input[name="rate"]').value = fit_data.tgt_rate
                    rateTableGroup.querySelector('input[name="rc_rate"]').value = fit_data.tgt_rc_rate
                    rateTableGroup.querySelector('input[name="rc_expo"]').value = fit_data.tgt_rc_expo
                    updateDatasetFromHTML(dataset.id);

                    // rateChart.update()
                }
            })


        } else {
            setTimeout(() => {
                document.querySelectorAll('.convert-btn').forEach(btn => btn.classList.remove('rainbow'))
                dataLayer.push(apiTrackingObject)
            }, 1000);
        }
    
    })
}




/* ============================================================
    1. gradient descent
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
    if (tgtRateType === "raceflight") {
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