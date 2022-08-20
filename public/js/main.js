window.addEventListener('load', () => {

    init()

})

function init(){

    generateRateTableGroup()
    generateRateTableGroup('raceflight')
   
}

function monitorChanges(e){
    if(e.target.selectedIndex == undefined){

        let rateType = Object.keys(rateDetails).filter(type => {
            return rateDetails[type].id == e.currentTarget.querySelector('.rateTypeSelector').selectedIndex;
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
        newRateTableGroup.querySelector('.rateTypeSelector').append(rateTypeSelect)
    })
   
    let rateTypeID = rateDetails[targetRateType.toLowerCase()].id
    newRateTableGroup.querySelector('.rateTypeSelector').selectedIndex = rateTypeID

    // TODO: createdataset generates dataset & ratetable ids, move this somewhere more elegant
    newRateTableGroup.dataset.id = createDataset(targetRateType)

    let targetDataset = currentData.datasets.find(dataset => dataset.id == newRateTableGroup.dataset.id)

    rateTable.append(newRateTableGroup)

    newRateTableGroup.style.boxShadow = `-4px 0px 0px 0px ${targetDataset.backgroundColor}`

    newRateTableGroup.addEventListener('input', monitorChanges)
    newRateTableGroup.addEventListener('focusin', sliderMonitor)
    newRateTableGroup.addEventListener('focusout', sliderMonitor)
    
    let deleteButton = newRateTableGroup.querySelector('.ratetable-delete')
    deleteButton.addEventListener('click', handleDeleteRateTableGroup, {once: true})

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
    rateTableGroup.querySelector('.maxAngularVel').textContent = targetDataset.rates.max

    targetDataset.data = generateCurve(targetDataset.label.toLowerCase(), targetDataset.rates.rate, targetDataset.rates.rc_rate, targetDataset.rates.rc_expo)

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


function convertRates(event){

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
                                rateTableGroup.querySelector('.convert-btn').classList.remove('rainbow')
                                updateDatasetFromHTML(dataset.id)
                            }
                        })
                    }
                });
        } else {
            setTimeout(() => {
                document.querySelectorAll('.convert-btn').forEach(btn => btn.classList.remove('rainbow'))
                dataLayer.push(apiTrackingObject)
            }, 1000);
        }
    
    })
}