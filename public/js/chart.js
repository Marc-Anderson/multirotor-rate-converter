const currentData = {
    labels: Array(1001 - 500).fill().map((_,i) => 500 + i),
    datasets: [],
    usedColors: []
};

const chartConfig = {
    type: 'line',
    data: currentData,
    options: {
        aspectRatio: ()=>{
            return window.innerWidth < 450 ? 1 : 1.7;
        },
        // // layout: {
        // //     padding: 10,
        // // },
        interaction: {
          mode: 'nearest',
        },
        scales: {
            yAxisID: {
                title: {
                    display: true,
                    text: 'Rate',
                    padding: {
                        top: 40,
                        bottom: -50
                    }
                },
                position: "left",
                min: 0,
                ticks: {
                  stepSize: 50
                }
            },
            xAxisID: {
                title: {
                    display: true,
                    text: 'RC Command',
                    padding: {
                        top: 0,
                        bottom: 0
                    }
                },
                position: "bottom",
                ticks: {
                    autoSkip: false,
                    callback: function(val, index) {
                        if(window.innerWidth < 450) {
                            return index % 50 === 0 ? this.getLabelForValue(val) : '';
                        }
                        // Hide every 20th tick label
                        return index % 20 === 0 ? this.getLabelForValue(val) : '';
                    }
                },
                grid: {
                    color: function(context) {
                        // color only every 20th tick
                        if(context.tick.value % 20 === 0){
                            return "rgba(0, 0, 0, 0.1)"
                        } else {
                            return ""
                        }
                    }
                }
            }
        }
    }
};

const rateChart = new Chart(
    document.getElementById('rateChart'),
    chartConfig
);

function createDataset(rateType = "betaflight"){

    let currentColor = colors.shift()

    let newChartDatasetTemplate = {
        id: rateTableGroupCounter,
        label: rateType.toSentenceCase(),
        backgroundColor: `${currentColor}`,
        borderColor: `${currentColor}`,
        data: [0, 700],
        pointStyle: 'circle',
        pointRadius: 0,
        rates: {
            rc_rate: rateDetails[rateType].rateValues.rc_rate.default,
            rate: rateDetails[rateType].rateValues.rate.default,
            rc_expo: rateDetails[rateType].rateValues.rc_expo.default,
            max: 0
        }
    }

    currentData.datasets.push(newChartDatasetTemplate)
    rateTableGroupCounter++
    return newChartDatasetTemplate.id

}
    