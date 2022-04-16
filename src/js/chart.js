const chartData = {
    labels: Array(1001 - 500).fill().map((_,i) => 500 + i),
    datasets: [
    ],
};

const chartConfig = {
    type: 'line',
    data: chartData,
    options: {
        aspectRatio: 1.9
    },
};

const rateChart = new Chart(
    document.getElementById('rateChart'),
    chartConfig
);

const createDataset = (newDatasetID) => {

    // let newDatasetID = chartData.datasets.length
    // let newDatasetID = rateTableGroupCounter
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
    