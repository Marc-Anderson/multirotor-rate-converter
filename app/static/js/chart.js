const currentData = {
    labels: Array(1001 - 500).fill().map((_,i) => 500 + i),
    datasets: [
    ],
    usedColors: []
};

const chartConfig = {
    type: 'line',
    data: currentData,
    options: {
        aspectRatio: 1.9,
        layout: {
            padding: 10,
        },
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'Rate'
                },
                min: 0,
                ticks: {
                  stepSize: 50
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'RC Command'
                },
                min: 500,
                max: 1000,
                ticks: {
                  stepSize: 100
                }
            }
        }
    },
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
        rates: {
            rc_rate: rateDetails[rateType].rateValues.rc_rate.default,
            rate: rateDetails[rateType].rateValues.rate.default,
            rc_expo: rateDetails[rateType].rateValues.rc_expo.default,
            max: 0
        },
        pointRadius: 0
    }

    currentData.datasets.push(newChartDatasetTemplate)
    rateTableGroupCounter++
    return newChartDatasetTemplate.id

}
    