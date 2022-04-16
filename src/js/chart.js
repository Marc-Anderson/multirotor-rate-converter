const chartData = {
    labels: Array(1001 - 500).fill().map((_,i) => 500 + i),
    datasets: [
    ],
};

const chartConfig = {
    type: 'line',
    data: chartData,
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

const createDataset = (newDatasetID) => {

    if(chartData.datasets.length > colors.length) return

    chartData.datasets[newDatasetID] = {
        id: parseFloat(newDatasetID),
        label: `Dataset ${newDatasetID}`,
        backgroundColor: `rgb(${colors[newDatasetID]})`,
        borderColor: `rgb(${colors[newDatasetID]})`,
        data: [0, 700],
        pointStyle: 'circle',
        pointRadius: 0
    }
}
    