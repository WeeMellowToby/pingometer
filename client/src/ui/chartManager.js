import { CHART_OPTIONS, chartHeight, chartWidth } from "../constants/config.js";
import { state } from "../utils/state.js";
import { getChartColors } from "../utils/colors.js";

function generateChart(item, chartsDiv, datasets) {
    const canvas = generateChartCanvas(chartsDiv, item);
    const ctx = canvas.getContext("2d");
    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: datasets.find(dataset => dataset.label === item.ip + " - " + item.ipName).times,
            datasets: datasets.filter(dataset => dataset.label === item.ip + " - " + item.ipName)
        },
        options: CHART_OPTIONS
    });
    //set chart variable in ipList object to the chart object
    item.chart = chart;
}
function generateChartCanvas(chartsDiv, IP_LIST_ITEM) {
    const canvasContainer = document.createElement("button");
    canvasContainer.className = "chartButton";
    canvasContainer.onclick = function () {
        IP_LIST_ITEM.needsAcknowledgement = false;
    };
    const canvas = document.createElement("canvas");
    canvas.style.maxHeight = `${chartHeight}px`;
    canvas.style.maxWidth = `${chartWidth}px`;
    canvas.width = chartWidth;
    canvas.height = chartHeight;
    canvasContainer.appendChild(canvas);
    chartsDiv.appendChild(canvasContainer);
    return canvas;
}
export async function updateCharts() {
    let datasets = generateDatasets();
    for (let i = 0; i < state.IPList.length; i++) {
        const ipListItem = state.IPList[i];
        if (!ipListItem.chart) {
            continue;
        }
        const chart = ipListItem.chart;
        chart.data.labels = datasets[i].times;
        chart.data.datasets = datasets.filter(dataset => dataset.label === ipListItem.ip + " - " + ipListItem.ipName);
        chart.update();
    }
}
function generateDatasets() {
    let bodyColor = "white";
    //create datasets for each IP
    const datasets = state.IPList.map(item => {
        let latencies = item.latencies.map(l => l.latency);
        let times = item.latencies.map(l => new Date(l.time * 1000).toLocaleTimeString('en-UK', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        if (latencies.length === 0) {
            latencies = [null];
            times = ["No data yet"];
        }
        //get the color for each graph
        let colors = getChartColors(item, bodyColor);
        const backgroundColor = colors[0];
        const borderColor = colors[1];
        bodyColor = colors[2];
        return {
            label: item.ip + " - " + item.ipName,
            data: latencies,
            fill: true,
            backgroundColor,
            borderColor,
            tension: 0.1,
            times
        };
    });
    return datasets;
}
export async function recreateCharts() {
    let datasets = generateDatasets();
    const chartsDiv = document.getElementById("charts");
    let scrollPosition = window.scrollY;
    chartsDiv.innerHTML = "";

    state.IPList.forEach(item => {
        generateChart(item, chartsDiv, datasets);
    });
    window.scrollTo(0, scrollPosition);
}
