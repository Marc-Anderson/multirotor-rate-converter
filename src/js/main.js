window.addEventListener('load', () => {

    init()

})

function init(){

    let rateTypes = Object.keys(TABS.pid_tuning.RATES_TYPE)

    rateTypes.forEach((rateTypeTitle) => {

        generateRateTableGroup(rateTypeTitle)
        createDataset(TABS.pid_tuning.RATES_TYPE[rateTypeTitle])
        updateDataset(TABS.pid_tuning.RATES_TYPE[rateTypeTitle])
    })
   
}

function monitorChanges(event){
    if(event.target.selectedIndex == undefined){
        updateDataset(this.dataset.id)
        updateSlider(event)
    } else {
        updateRateTableGroup(this.dataset.id)
        updateDataset(this.dataset.id)
    }
}

function updateRateTableGroup(groupID){

    let rateTableGroup = document.querySelectorAll('.ratetable-group')[groupID]

    let currentRateTypeID = rateTableGroup.querySelector('.rateTypeSelector').selectedIndex

    let rc_rate_title = rateTableGroup.querySelector('.rc_rate_title')
        rc_rate_title.textContent = rateDetails[currentRateTypeID].rc_rate.title

    let rate_title = rateTableGroup.querySelector('.rate_title')
        rate_title.textContent = rateDetails[currentRateTypeID].roll_rate.title

    let expo_title = rateTableGroup.querySelector('.expo_title')
        expo_title.textContent = rateDetails[currentRateTypeID].rc_expo.title
    
    let rc_rate_e = rateTableGroup.querySelector('input[name="rc_rate"]')
        rc_rate_e.step = rateDetails[currentRateTypeID].rc_rate.step
        rc_rate_e.min = rateDetails[currentRateTypeID].rc_rate.min
        rc_rate_e.max = rateDetails[currentRateTypeID].rc_rate.max
        rc_rate_e.value = rateDetails[currentRateTypeID].rc_rate.default

    let roll_rate_e = rateTableGroup.querySelector('input[name="roll_rate"]')
        roll_rate_e.step = rateDetails[currentRateTypeID].roll_rate.step
        roll_rate_e.min = rateDetails[currentRateTypeID].roll_rate.min
        roll_rate_e.max = rateDetails[currentRateTypeID].roll_rate.max
        roll_rate_e.value = rateDetails[currentRateTypeID].roll_rate.default

    let rc_expo_e = rateTableGroup.querySelector('input[name="rc_expo"]')
        rc_expo_e.step = rateDetails[currentRateTypeID].rc_expo.step
        rc_expo_e.min = rateDetails[currentRateTypeID].rc_expo.min
        rc_expo_e.max = rateDetails[currentRateTypeID].rc_expo.max
        rc_expo_e.value = rateDetails[currentRateTypeID].rc_expo.default
        
}


function generateRateTableGroup(targetRateType = "BETAFLIGHT"){

    let rateTypeTitles = Object.keys(TABS.pid_tuning.RATES_TYPE)

    let rateTable = document.getElementById('ratetable')
    let rateTableGroupTemplate = document.getElementById('ratetable-group-template').content
    let newRateTableGroup = rateTableGroupTemplate.cloneNode(true).firstElementChild

    rateTypeTitles.forEach(rateType => {
        let newSelect = document.createElement('option')
        newSelect.textContent = rateType.toSentenceCase()
        newSelect.value = TABS.pid_tuning.RATES_TYPE[rateType]
        newRateTableGroup.querySelector('.rateTypeSelector').append(newSelect)
    })
   
    let targetRateTypeID = TABS.pid_tuning.RATES_TYPE[targetRateType.toUpperCase()]
    newRateTableGroup.querySelector('.rateTypeSelector').selectedIndex = targetRateTypeID
    
    newRateTableGroup.dataset.id = rateTableGroupCounter
    rateTable.append(newRateTableGroup)

    updateRateTableGroup(rateTableGroupCounter)

    newRateTableGroup.addEventListener('input', monitorChanges)
    // newRateTableGroup.addEventListener('change', monitorChanges)

    newRateTableGroup.addEventListener('focusin', sliderMonitor)
    newRateTableGroup.addEventListener('focusout', sliderMonitor)

    rateTableGroupCounter++

}

function createDataset(groupID){

    let colors = [
        '255,61,2',
        '77,209,33',
        '41,63,255',
        '232,203,14',
        '177,61,255',
    ]

    if(data.datasets.length - 1 < groupID){
        data.datasets[groupID] = {
            label: `Dataset ${groupID}`,
            backgroundColor: `rgb(${colors[groupID]})`,
            borderColor: `rgb(${colors[groupID]})`,
            data: [0, 700],
            pointStyle: 'circle',
            pointRadius: 0
        }
    }
}
    
function updateDataset(groupID){

    let rateTableGroup = document.querySelectorAll('.ratetable-group')[groupID]

    let currentRateTypeID = rateTableGroup.querySelector('.rateTypeSelector').selectedIndex

    let roll_rate = rateTableGroup.querySelector('input[name="roll_rate"]').value
    let rc_rate = rateTableGroup.querySelector('input[name="rc_rate"]').value
    let rc_expo = rateTableGroup.querySelector('input[name="rc_expo"]').value

            
    let maxAngularVel_e = rateTableGroup.querySelector('.maxAngularVel')
        maxAngularVel_e.textContent = getRateTableGroupMaxAngularVel(groupID)

    data.datasets[groupID].label = Object.keys(TABS.pid_tuning.RATES_TYPE)[currentRateTypeID].toSentenceCase()

    data.datasets[groupID].data = generateCurve(currentRateTypeID, roll_rate, rc_rate, rc_expo)

    myChart.update()

}


function getRateTableGroupMaxAngularVel(groupID) {

    let tgtRateTableGroup = document.querySelectorAll('.ratetable-group')[groupID]

    let currentRateTypeID = parseFloat(tgtRateTableGroup.querySelector('.rateTypeSelector').selectedIndex)

    let roll_rate = parseFloat(tgtRateTableGroup.querySelector('input[name="roll_rate"]').value)
    let rc_rate = parseFloat(tgtRateTableGroup.querySelector('input[name="rc_rate"]').value)
    let rc_expo = parseFloat(tgtRateTableGroup.querySelector('input[name="rc_expo"]').value)

    let superExpoActive = true
    let deadband = 0
    let limit = 1998

    TABS.pid_tuning.currentRatesType = currentRateTypeID

    let maxVel = TABS.pid_tuning.rateCurve.getMaxAngularVel(roll_rate, rc_rate, rc_expo, superExpoActive, deadband, limit)

    return parseInt(maxVel)
}

function sliderMonitor(e){
    
    if(e.target.classList.contains('rateTypeSelector')) return

    let slider = document.getElementById('rateSlider')
        slider.min = e.target.min
        slider.max = e.target.max
        slider.step = e.target.step
        slider.value = e.target.value

    slider.oninput = function () {
        e.target.value = this.value
        updateDataset(e.target.closest('.ratetable-group').dataset.id)
    }
}

function updateSlider(e){

    let slider = document.getElementById('rateSlider')
        slider.min = e.target.min
        slider.max = e.target.max
        slider.step = e.target.step
        slider.value = e.target.value
        
}