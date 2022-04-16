const data = {
    labels: Array(1001 - 500).fill().map((_,i) => 500 + i),
    datasets: [
        {
            label: 'Dataset 1',
            backgroundColor: 'rgb(255,61,2)',
            borderColor: 'rgb(255,61,2)',
            data: Array(700 - 0).fill().map((_,i) => 0 + i),
            pointStyle: 'circle',
            pointRadius: 0
        }
    ],
};

const config = {
    type: 'line',
    data: data,
    options: {
        aspectRatio: 1.9
    },
};

const myChart = new Chart(
    document.getElementById('chart'),
    config
);