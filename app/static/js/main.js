window.addEventListener('load', () => {

    init()

})

function init(){

    generateRateTableGroup()
    generateRateTableGroup('actual')

    // defaults: 
    //   - server api calculation
    //   - legacy ui
    const legacySwitches = document.querySelectorAll('.legacy-switch');
    const apiSwitch = document.getElementById('api-switch');
    const chartDiffSwitch = document.getElementById('diff-switch');
    const sliderModeSwitch = document.getElementById('slider-mode-switch');

    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('api') == 1 || urlParams.get('api') == 2) {
        config.api_version = parseInt(urlParams.get('api'));
    }
    apiSwitch.checked = config.api_version - 1

    if (urlParams.get('ui') == 1 || urlParams.get('ui') == 2) {
        config.ui_version = parseInt(urlParams.get('ui'));
    }
    legacySwitches.forEach(switchElement => switchElement.checked = config.ui_version - 1);

    if (urlParams.get('slider') == 1 || urlParams.get('slider') == 2) {
        config.mobile_slider_mode = parseInt(urlParams.get('slider'));
    }
    sliderModeSwitch.checked = config.mobile_slider_mode - 1;

    if (urlParams.get('chart_diff') == 1 || urlParams.get('chart_diff') == 2) {
        config.chart_diff_mode = parseInt(urlParams.get('chart_diff')) - 1;
    }
    chartDiffSwitch.checked = config.chart_diff_mode;
    if(config.chart_diff_mode){
        rateChart.custom.toggleChartDiff();
    }

    updateUiVersion();
    legacySwitches.forEach(switchElement => {
        switchElement.addEventListener('change', (e) => {
            legacySwitches.forEach(switchEl => switchEl.checked = e.target.checked);
            config.ui_version = e.target.checked + 1;
            updateUiVersion();

            // update the url parameter
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('ui', config.ui_version);
            // push the change to the window history
            window.history.pushState({}, '', currentUrl);
        });
    })

    apiSwitch.addEventListener('change', (e) => {
        document.documentElement.classList.toggle('local');
        config.api_version = e.target.checked ? 2 : 1;

        // update the url parameter
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('api', config.api_version);
        // push the change to the window history
        window.history.pushState({}, '', currentUrl);

    });

    chartDiffSwitch.addEventListener('change', (e) => {
        config.chart_diff_mode = e.target.checked;
        rateChart.custom.toggleChartDiff();

        // update the url parameter
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('chart_diff', config.chart_diff_mode + 1);
        // push the change to the window history
        window.history.pushState({}, '', currentUrl);
    });

    updateMobileSliderMode();
    sliderModeSwitch.addEventListener('change', (e) => {
        config.mobile_slider_mode = e.target.checked ? 2 : 1;

        updateMobileSliderMode();
        // update the url parameter
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('slider', config.mobile_slider_mode);
        // push the change to the window history
        window.history.pushState({}, '', currentUrl);
    });


    function updateMobileSliderMode(){
        if(config.mobile_slider_mode == 2){
            // enable the focus mode features
            document.querySelectorAll('.ratetable-group input[type="number"]').forEach(input => {
                // set all of the input modes to none so it doesnt automatically focus and open keyboard
                input.setAttribute('inputmode', 'none');
                
                // enable the focus mode features
                input.addEventListener('focusin', handleFocusSliderOnFirstTapOpenKeyboardOnSecondTap);
                input.addEventListener('focusout', removeInputMode);
                // 
            });

        } else {
            // disable the slider focus mode feature
            document.querySelectorAll('.ratetable-group input[type="number"]').forEach(input => {
                // set all of the input modes to back to the default setting
                input.setAttribute('inputmode', 'decimal');
                
                // enable the focus mode features
                input.removeEventListener('focusin', handleFocusSliderOnFirstTapOpenKeyboardOnSecondTap);
                input.removeEventListener('focusout', removeInputMode);
                // 
            });
        }
    }

    
    let useCount = 0
    function handleFocusSliderOnFirstTapOpenKeyboardOnSecondTap(e){
        const sliderElement = document.querySelector('.slider');

        if(e.relatedTarget === sliderElement) {
            // do the normal stuff
        } else {
            e.preventDefault();
            sliderElement.focus();
            if(config.ui_version == 2 && useCount <= 4){
                sliderElement.classList.add('attention-grab');
                setTimeout(() => {
                    sliderElement.classList.remove('attention-grab');
                }, 300);
            }
            useCount++
            e.target.setAttribute("inputmode", 'decimal')
            return
        }
    }

    function removeInputMode(e){
        e.target.setAttribute("inputmode", 'none')
    }

    // open dialog when clicking the title of the page
    const optionDialog = document.getElementById('option-dialog');
    document.querySelector('.settings-btn').addEventListener('click', ()=>{
        optionDialog.showModal();
    })
    
    // close dialog on click outside
    document.querySelector('dialog').addEventListener('click', (event)=>{
        var rect = optionDialog.getBoundingClientRect();
        var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            optionDialog.close();
        }
    })
    
    // reload the page when the user presses the back button
    // this should not trap the user on our page
    // we want to be sure the page reloads if the user changed any of the settings so they are applied
    window.addEventListener('popstate', function(event) {
        window.location.reload();
    });
}


function updateRateTableGroup(datasetID){
    
    let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${datasetID}"]`)
    
    let rateType = Object.keys(rateDetails).filter(type => {
        return rateDetails[type].id == rateTableGroup.querySelector('.ratetype-selector').selectedIndex;
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


function updateUiVersion(){

    if(config.ui_version == 1){
        document.documentElement.classList.add('legacy');
    } else {
        document.documentElement.classList.remove('legacy');
    }
    rateChart.custom.updateUiMode();

    // rateChart.update();

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
    rateTableGroup.querySelectorAll('.maxAngularVel').forEach(maxAngularVel => maxAngularVel.value = targetDataset.rates.max)

    targetDataset.data = generateCurve(targetDataset.label.toLowerCase(), targetDataset.rates.rate, targetDataset.rates.rc_rate, targetDataset.rates.rc_expo)

    let totalDeltaElement = document.querySelector(`.totalDelta`)
    
    try {
        // todo: consider finding a way to implement this with more than 2 ratetables
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

    // todo: implement 2 clicks for editing inputs, currently processing 2 events
    // const currentFocusElementName = rateTableGroup.getAttribute('current-focus-target') | e.target.name;
    // const rateTableGroup = e.target.closest('.ratetable-group');
    // rateTableGroup.setAttribute('current-focus-target', e.target.name)
    // maybe something like this or using readonly
    // if(config.ui_version == 2 && window.innerWidth <= 450){
    //     newRateTableGroup.querySelectorAll('input.rate-input').forEach(input => input.setAttribute('inputmode', 'none'));
    // }

    if(e.type == 'focusin'){
        toggleActiveRow(e.target.closest('.ratetable-group').dataset.id);
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

    rateTableGroup.removeEventListener('input', monitorChanges)
    rateTableGroup.removeEventListener('focusin', sliderMonitor)
    rateTableGroup.removeEventListener('focusout', sliderMonitor)
    let deleteButton = rateTableGroup.querySelector('.ratetable-delete')
        deleteButton.removeEventListener('click', deleteRateTableGroup)

    let targetDataset = currentData.datasets.find(dataset => dataset.id == datasetID)

    colors.push(targetDataset.backgroundColor)
    
    currentData.datasets.splice(currentData.datasets.indexOf(targetDataset),1)

    rateTableGroup.remove()
    rateChart.update()
    
}

let test;

async function convertRates ( event ) {
    if ( !event.target.classList.contains( 'convert-btn' ) ) return;
    if ( event.target.classList.contains( 'rainbow' ) ) return;

    const calculationType = config.api_version == 1 ? 'api' : 'local';
    const lastActiveGroupId = document.querySelector('.ratetable-group.active')?.dataset.id;
    // fakeEvent = {target: {closest: function () {return {dataset: {id: 0}}}}}

    document.querySelectorAll('.convert-btn').forEach(btn => btn.classList.add('rainbow'));
    
    let datasetID = event.target?.closest('.ratetable-group')?.dataset.id ?? lastActiveGroupId ?? 0;

    toggleActiveRow(datasetID);

    let sourceDataset = currentData.datasets.find(dataset => dataset.id == datasetID)

    let srcRateType = sourceDataset.label.toLowerCase()
    let rate = sourceDataset.rates.rate
    let rc_rate = sourceDataset.rates.rc_rate
    let rc_expo = sourceDataset.rates.rc_expo

    let apiTrackingObject = {
        event: calculationType == 'local' ? 'convert_rates_local' : 'convert_rates',
        srcRateType: srcRateType,
        rate: rate,
        rc_rate: rc_rate,
        rc_expo: rc_expo,
        tgtRateTypes: [],
        api_version: config.api_version,
        ui_version: config.ui_version,
        chart_diff_mode: config.chart_diff_mode,
        mobile_slider_mode: config.mobile_slider_mode
    }

    let targetRateTypes = new Set(currentData.datasets.map(dataset => dataset.label.toLowerCase()))
    let fitDataPromises = [];

    for(let tgtRateType of targetRateTypes){
        if(tgtRateType !== srcRateType){
            apiTrackingObject.tgtRateTypes.push(tgtRateType);

            let fitDataPromise;

            if(calculationType == 'local'){

                fitDataPromise = fetchFitDataLocally({...apiTrackingObject, tgtRateType});

            } else {

                fitDataPromise = fetchFitDataApi({...apiTrackingObject, tgtRateType})

            }            

            fitDataPromises.push(fitDataPromise)
        }
    }
    // todo: use allsettled and conditionally handle recalculation
    const fitDataPromisesResults = await Promise.all(fitDataPromises);

    const fitDataResults = await Promise.all(
        fitDataPromisesResults.map(response => response.json())
    );

    fitDataResults.forEach(fitData => {

        for(let dataset of currentData.datasets){
            if(dataset.label.toLowerCase() == fitData.tgtRateType){
                let rateTableGroup = document.querySelector(`.ratetable-group[data-id="${dataset.id}"]`)

                rateTableGroup.querySelector('input[name="rate"]').value = fitData.tgt_rate
                rateTableGroup.querySelector('input[name="rc_rate"]').value = fitData.tgt_rc_rate
                rateTableGroup.querySelector('input[name="rc_expo"]').value = fitData.tgt_rc_expo

                rateTableGroup.querySelector('.convert-btn').classList.remove('rainbow')

                updateDatasetFromHTML(dataset.id)
            }
        }
    })

    document.querySelectorAll('.convert-btn').forEach(btn => btn.classList.remove('rainbow'));

    if (typeof window.dataLayer === 'undefined') { window.dataLayer = [] }
    dataLayer.push(apiTrackingObject);

}

function fetchFitDataApi(rateRequestDataObject){
    let requestUrl = `srcRateType=${rateRequestDataObject.srcRateType}&rate=${rateRequestDataObject.rate}&rc_rate=${rateRequestDataObject.rc_rate}&rc_expo=${rateRequestDataObject.rc_expo}&tgtRateType=${rateRequestDataObject.tgtRateType}`
    
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`${window.location.origin}/api?${requestUrl}`);
            if (!response.ok || response.status === 503) {
                throw new Error('rate fitter api unavailable');
            }
            resolve(response);
        } catch (error) {
            console.warn('calculating locally', error);
            resolve(await fetchFitDataLocally(rateRequestDataObject));
        }
    });
}


function fetchFitDataLocally(rateRequestDataObject) {
    const gradientDescentWorker = new Worker('./js/gradientDescentWorker.js');
    return new Promise((resolve, reject) => {
        gradientDescentWorker.onmessage = function(e) {
            if(e.data.request_status === "failed"){
                reject(e);
            }
            resolve({ json: () => {
                return Promise.resolve(e.data)
            }});
            gradientDescentWorker.terminate();
        };
        gradientDescentWorker.postMessage(rateRequestDataObject);
    });
}
