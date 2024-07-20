
const shiftYAxisTicksPlugin = {
    id: 'shiftYTicks',
    afterDraw ( chart ) {

        if(window.innerWidth >= 450) return;

        const yAxis = chart.scales.yAxisID;
        if ( !yAxis ) return;

        // define the shift amount (pixels)
        labelColor = "rgba(0, 0, 0, 0.62)";
        const tickShift = 10;

        // get the canvas context for drawing
        const ctx = chart.ctx;
        
        yAxis.ticks.forEach( ( tick, index ) => {
            // get y position of tick label
            const tickValue = yAxis.getPixelForValue( tick.value );

            // save the current canvas state
            ctx.save();

            // clear the original tick label
            ctx.clearRect( yAxis.left, tickValue - 10, yAxis.width, 18 );

            // format the new tick label text
            ctx.fillStyle = labelColor;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            // draw the shifted tick
            ctx.fillText( tick.label, yAxis.right + tickShift, tickValue );
            // restore the canvas state
            ctx.restore();
        } );
    }
};
Chart.register( shiftYAxisTicksPlugin );

const currentData = {
    labels: Array(1001 - 500).fill().map((_,i) => 500 + i),
    datasets: [],
    usedColors: []
};

const chartConfig = {
    type: 'line',
    data: currentData,
    options: {
        plugins: [shiftYAxisTicksPlugin],
        aspectRatio: ()=>{
            return window.innerWidth < 450 ? 1.4 : 1.6;
        },
        layout: {
            padding: {
                left:  -20
            },
        },
        elements: {
            line: {
                tension: 0.4,
                borderJoinStyle: 'round',
                borderCapStyle: 'round',
                borderWidth: 4,
            }
        },
        interaction: {
          mode: 'nearest',
        },
        scales: {
            yAxisID: {
                title: {
                    display: () => { return window.innerWidth < 450 ? false : true },
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
                        top: -10,
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
    

// rateChart.config.options.scales.yAxisID.title.padding.top = 40
// rateChart.config.options.scales.yAxisID.title.padding.bottom = -50
// rateChart.config.options.scales.xAxisID.title.padding.bottom = 0
// rateChart.config.options.scales.xAxisID.title.padding.top = 0
// rateChart.config.options.scales.yAxisID.ticks.padding = -30
// rateChart.config.options.scales.yAxisID.ticks.z = 1
// vertical
// rateChart.config.options.scales.yAxisID.ticks.labelOffset = -51
// rateChart.config.options.scales.yAxisID.ticks.align = "center"
// rateChart.config.options.scales.yAxisID.ticks.padding = -20
// rateChart.config.options.scales.ticks.z = 1
// delete rateChart.config.options.scales.xAxisID.title
// rateChart.update()