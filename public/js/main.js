window.addEventListener('load', () => {

    init()

})

function init(){

    generateRateTableGroup()
    generateRateTableGroup('raceflight')
   
}

function monitorChanges(event){
    if(event.target.selectedIndex == undefined){
        updateDatasetFromHTML(this.dataset.id)

        let slider = document.getElementById('rateSlider')
            slider.value = event.target.value

    } else {
        toggleActiveRow(this.dataset.id)
        setRateTableGroupDefaults(this.dataset.id)
        updateDatasetFromHTML(this.dataset.id)
    }
}

function setRateTableGroupDefaults(groupID){

    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${groupID}"]`)

    let rateType = Object.keys(rateDetails).filter(type => {
        return rateDetails[type].id == rateTableGroup.querySelector('.rateTypeSelector').selectedIndex;
    })[0]

    let rc_rate_title = rateTableGroup.querySelector('.rc_rate_title')
        rc_rate_title.textContent = rateDetails[rateType].rateValues.rc_rate.title

    let rate_title = rateTableGroup.querySelector('.rate_title')
        rate_title.textContent = rateDetails[rateType].rateValues.rate.title

    let expo_title = rateTableGroup.querySelector('.expo_title')
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
        
}


function generateRateTableGroup(targetRateType = "betaflight"){

    if(chartData.datasets.length > colors.length) {
        window.alert("Sorry, you've reached the limit. wtf are you using so many anyway.")
        return
    }

    let rateTypeTitles = Object.keys(rateDetails)

    let rateTable = document.getElementById('ratetable')
    let rateTableGroupTemplate = document.getElementById('ratetable-group-template').content
    let newRateTableGroup = rateTableGroupTemplate.cloneNode(true).firstElementChild

    rateTypeTitles.forEach(rateType => {
        let newSelect = document.createElement('option')
        newSelect.textContent = rateDetails[rateType].label
        newSelect.value = rateDetails[rateType].id
        newRateTableGroup.querySelector('.rateTypeSelector').append(newSelect)
    })
   
    let targetRateTypeID = rateDetails[targetRateType.toLowerCase()].id
    newRateTableGroup.querySelector('.rateTypeSelector').selectedIndex = targetRateTypeID

    newRateTableGroup.dataset.id = rateTableGroupCounter
    rateTable.append(newRateTableGroup)

    setRateTableGroupDefaults(newRateTableGroup.dataset.id)

    newRateTableGroup.style.boxShadow = `-4px 0px 0px 0px rgb(${colors[newRateTableGroup.dataset.id]})`

    newRateTableGroup.addEventListener('input', monitorChanges)
    newRateTableGroup.addEventListener('focusin', sliderMonitor)
    newRateTableGroup.addEventListener('focusout', sliderMonitor)

    function handleDeleteRateTableGroup(e){
        let id = e.target.closest('.ratetable-group').dataset.id
        deleteRateTableGroup(id)
    }
    
    let deleteButton = newRateTableGroup.querySelector('.ratetable-delete')
    deleteButton.addEventListener('click', handleDeleteRateTableGroup)

    // TODO: maybe move these away to their own assembly function
    createDataset(newRateTableGroup.dataset.id)
    updateDatasetFromHTML(newRateTableGroup.dataset.id)

    rateTableGroupCounter++

}
    
function updateDatasetFromHTML(groupID){

    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${groupID}"]`)

    // let currentRateTypeID = rateTableGroup.querySelector('.rateTypeSelector').selectedIndex
    let rateType = Object.keys(rateDetails).filter(type => {
        return rateDetails[type].id == rateTableGroup.querySelector('.rateTypeSelector').selectedIndex;
    })[0]

    let rate = rateTableGroup.querySelector('input[name="rate"]').value
    let rc_rate = rateTableGroup.querySelector('input[name="rc_rate"]').value
    let rc_expo = rateTableGroup.querySelector('input[name="rc_expo"]').value

    let maxAngularVel_e = rateTableGroup.querySelector('.maxAngularVel')
        maxAngularVel_e.textContent = getRateTableGroupMaxAngularVel(groupID)

    let targetDataset = chartData.datasets.find(dataset => dataset.id == groupID)

    targetDataset.label = rateDetails[rateType].label

    targetDataset.data = generateCurve(rateType, rate, rc_rate, rc_expo)

    let rateTableGroups = document.querySelectorAll('.ratetable-group')

    rateTableGroups.forEach(rtGroup => {
        let diffFromSelected_e = rtGroup.querySelector('.diffFromSelected')

        if(rtGroup == rateTableGroup) {
            diffFromSelected_e.textContent = 0
            return
        }
        
        let difference = sumCurveDifference(targetDataset.data, chartData.datasets.find(dataset => dataset.id == rtGroup.dataset.id).data).toFixed(0)

        if(parseInt(diffFromSelected_e.textContent) < difference) {
            colorpop(diffFromSelected_e, 'neg')
        } else if (parseInt(diffFromSelected_e.textContent) > difference) {
            colorpop(diffFromSelected_e, 'pos')
        }

        diffFromSelected_e.textContent = difference
    })

    rateChart.update()

}


function getRateTableGroupMaxAngularVel(groupID) {

    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${groupID}"]`)

    // let currentRateTypeID = parseFloat(tgtRateTableGroup.querySelector('.rateTypeSelector').selectedIndex)
    let rateType = Object.keys(rateDetails).filter(type => {
        return rateDetails[type].id == rateTableGroup.querySelector('.rateTypeSelector').selectedIndex;
    })[0]

    let rate = parseFloat(rateTableGroup.querySelector('input[name="rate"]').value)
    let rc_rate = parseFloat(rateTableGroup.querySelector('input[name="rc_rate"]').value)
    let rc_expo = parseFloat(rateTableGroup.querySelector('input[name="rc_expo"]').value)

    let superExpoActive = true
    let deadband = 0
    let limit = 1998

    TABS.pid_tuning.currentRatesType = rateDetails[rateType].id

    let maxVel = TABS.pid_tuning.rateCurve.getMaxAngularVel(rate, rc_rate, rc_expo, superExpoActive, deadband, limit)

    return parseInt(maxVel)
}

let toggleActiveRow = (groupID) => {

    let rateTableGroups = document.querySelectorAll('.ratetable-group')

    document.querySelector(':root').style.setProperty('--slider-color', chartData.datasets.find(dataset => dataset.id == groupID).backgroundColor)   

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
        updateDatasetFromHTML(e.target.closest('.ratetable-group').dataset.id)
    }

}

function deleteRateTableGroup(id){

    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${id}"]`)
    
    if(rateTableGroup === undefined || rateTableGroup === null) throw new Error("This ratetable id does not exist")

    rateTableGroup.remove('input', monitorChanges)
    rateTableGroup.remove('focusin', sliderMonitor)
    rateTableGroup.remove('focusout', sliderMonitor)
    let deleteButton = rateTableGroup.querySelector('.ratetable-delete')
        deleteButton.remove('click', deleteRateTableGroup)

    chartData.datasets = chartData.datasets.filter(dataset => dataset.id !== id)

    rateTableGroup.remove()
    rateChart.update()
}

function colorpop(target, type){
    target.classList.add('colorpop')

    if(type === 'pos'){
        target.classList.add('positive')
        setTimeout(() => {
            target.classList.remove('positive')
        }, 400);    
            
    }
    if(type === 'neg'){
        target.classList.add('negative')
        setTimeout(() => {
            target.classList.remove('negative')
        }, 400);
    }

    setTimeout(() => {
        target.classList.remove('colorpop')
    }, 600);

}