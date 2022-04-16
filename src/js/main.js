window.addEventListener('load', () => {

    init()

})

function init(){

    let rateTypes = Object.keys(TABS.pid_tuning.RATES_TYPE)

    rateTypes.forEach((rateTypeTitle) => {

        generateRateTableGroup(rateTypeTitle)
    })
   
}

function monitorChanges(event){
    if(event.target.selectedIndex == undefined){
        updateDataset(this.dataset.id)

        let slider = document.getElementById('rateSlider')
            slider.value = event.target.value

    } else {
        toggleActiveRow(this.dataset.id)
        updateRateTableGroup(this.dataset.id)
        updateDataset(this.dataset.id)
    }
}

function updateRateTableGroup(groupID){

    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${groupID}"]`)

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

    updateRateTableGroup(newRateTableGroup.dataset.id)

    newRateTableGroup.addEventListener('input', monitorChanges)

    newRateTableGroup.addEventListener('focusin', sliderMonitor)
    newRateTableGroup.addEventListener('focusout', sliderMonitor)

    createDataset(newRateTableGroup.dataset.id)
    updateDataset(newRateTableGroup.dataset.id)

    rateTableGroupCounter++

}
    
function updateDataset(groupID){

    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${groupID}"]`)

    let currentRateTypeID = rateTableGroup.querySelector('.rateTypeSelector').selectedIndex

    let roll_rate = rateTableGroup.querySelector('input[name="roll_rate"]').value
    let rc_rate = rateTableGroup.querySelector('input[name="rc_rate"]').value
    let rc_expo = rateTableGroup.querySelector('input[name="rc_expo"]').value

    let maxAngularVel_e = rateTableGroup.querySelector('.maxAngularVel')
        maxAngularVel_e.textContent = getRateTableGroupMaxAngularVel(groupID)

    let targetDataset = chartData.datasets.find(dataset => dataset.id == groupID)
    targetDataset.label = Object.keys(TABS.pid_tuning.RATES_TYPE)[currentRateTypeID].toSentenceCase()

    targetDataset.data = generateCurve(currentRateTypeID, roll_rate, rc_rate, rc_expo)

    rateChart.update()

}


function getRateTableGroupMaxAngularVel(groupID) {

    let tgtRateTableGroup = document.querySelector(`.ratetable-group[data-id="${groupID}"]`)

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

let toggleActiveRow = (groupID) => {

    let rateTableGroups = document.querySelectorAll('.ratetable-group')

    rateTableGroups.forEach(rateTableGroup => {
        if(rateTableGroup.dataset.id == groupID){
            rateTableGroup.classList.add('active')
        } else {
            rateTableGroup.classList.remove('active')
        }
    })
}

function sliderMonitor(e){
    
    if(e.target.classList.contains('rateTypeSelector')) return

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
        updateDataset(e.target.closest('.ratetable-group').dataset.id)
    }

}

function deleteRateTableGroup(id){

    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${id}"]`)

    if(rateTableGroup === undefined || rateTableGroup === null) throw new Error("This ratetable id does not exist")

    chartData.datasets = chartData.datasets.filter(dataset => dataset.id !== id)

    rateTableGroup.remove()
    rateChart.update()
}