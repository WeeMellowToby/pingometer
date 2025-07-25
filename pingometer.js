let ipList = [];

const COLORS = [
    ["rgba(0,0,139,0.2)", "rgb(0, 0, 139)", "white"],
    ["rgba(249, 105, 14,0.2)", "rgb(249, 105, 14)", "orange"],
    ["rgba(255, 0, 0,0.5)", "rgb(255, 0, 0)", "darkred"]
]
const IP_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
// Load saved IPs when the page loads
window.onload = function () {
    //ips will be saved as an array of objects {ip: 8.8.8.8, name: Google DNS}
    const savedIPs = JSON.parse(localStorage.getItem("IPList"));
    if (savedIPs) {
        ipList = savedIPs;
        updateIPList();
    }
};

// Function to save IPs to localStorage
function saveIPs() {
    localStorage.setItem("IPList", JSON.stringify(ipList.map(item => ({ ip: item.ip, name: item.name }))));
}

async function updateIPTable(data) {
    const ipListDOM = document.getElementById("ipList");
    ipListDOM.innerHTML = `<tr>
            <th>IP</th>
            <th>Name</th>
            <th>Status</th>
            <th></th>
        </tr>`; // Clear existing list
    ipList.forEach(ip => {
        let online = false
        const latencies = data.filter(item => item.ip === ip.ip).map(item => item.latency);
        if (latencies[latencies.length - 1] != 0) {
            online = true;
        }
        const listItem = document.createElement("tr");
        listItem.id = `status-${ip.ip}`;
        listItem.innerHTML = `<td>${ip.ip} </td> 
        <td>${ip.name}</td>
        <td>${online ? "Online" : "Offline"}</td>
        <td><button onclick="removeIP('${ip.ip}')" class="removeButton">&#10006;</button></td>`;
        ipListDOM.appendChild(listItem);
    });
}

// Function to update the displayed list of IPs
function updateIPList() {
    updateChart();
}

// Add an IP to the list
function addIP() {
    const ip = document.getElementById("ipInput").value.trim();
    // check if IP matches the regex ^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$
    if (!ip.match(IP_REGEX)) {
        alert("Invalid IP address");
        return;
    }
    const name = document.getElementById("nameInput").value.trim();
    item = { ip: ip, name: name };
    if (ip && !ipList.includes(item)) {
        ipList.push(item);
        saveIPs();
        updateIPList();
    }
    document.getElementById("ipInput").value = "";
    document.getElementById("nameInput").value = "";
}

// Remove an IP from the list
function removeIP(ip) {
    ipList = ipList.filter(item => item.ip !== ip);
    saveIPs();
    updateIPList();
}

// Ping the saved IPs
async function pingIPs() {
    if (ipList.length === 0) return;
    await fetch(window.location.href + "ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ips: ipList.map(item => item.ip) })
    });
}

// Update the line charts
async function updateChart() {
    await pingIPs();
    const response = await fetch(window.location.href + "results");
    const data = await response.json();
    updateIPTable(data);
    const allIPs = data.map(item => item.ip);
    const distinctIPs = [...new Set(allIPs)].sort();
    //read data and get all distinct IPs, and make sure they're the same ips being requested
    datasets = generateDatasets(data);
    //create a canvas with a chart for each IP address in the div with id "charts"
    //charts need to be 500 long and 300 high, with time on the x-axis and latency on the y-axis
    const chartsDiv = document.getElementById("charts");
    let scrollPosition = window.scrollY;
    chartsDiv.innerHTML = "";

    distinctIPs.forEach(ip => {
        const IP_LIST_ITEM = ipList.find(item => item.ip === ip);
        //check if IP is in the list
        if (!IP_LIST_ITEM) {
            return;
        }
        const canvasContainer = document.createElement("button");
        canvasContainer.className = "chartButton";
        canvasContainer.onclick = function () {
            ipList[ipList.indexOf(IP_LIST_ITEM)].needsAcknowledgement = false;
            updateChartData();
        }
        const canvas = document.createElement("canvas");
        canvas.style.maxHeight = "150px";
        canvas.style.maxWidth = "200px";
        canvas.width = 200;
        canvas.height = 150;
        canvasContainer.appendChild(canvas);
        chartsDiv.appendChild(canvasContainer);
        const ctx = canvas.getContext("2d");
        const chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: datasets.find(dataset => dataset.label === ip + " - " + IP_LIST_ITEM.name).times,
                datasets: datasets.filter(dataset => dataset.label === ip + " - " + IP_LIST_ITEM.name)
            },
            options: {
                elements: {
                    point: {
                        radius: 0
                    }
                },
                scales: {
                    x: {
                        display: false,
                        ticks: {
                            display: false,
                            callback: function (value, index, values) {
                                return "";
                            }
                        }
                    }
                },
                animation: false, // Disable animation
                scales: {
                    x: {
                        title: {
                            display: false,
                            text: "Time"
                        }
                    },
                    y: {
                        title: {
                            display: false,
                            text: "Latency"
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            boxWidth: 0
                        }
                    }
                }
            }
        });
        //set chart variable in ipList object to the chart object
        ipList[ipList.indexOf(IP_LIST_ITEM)].chart = chart;
    });
    window.scrollTo(0, scrollPosition);
}
async function updateChartData() {
    const response = await fetch(window.location.href + "results");
    const data = await response.json();
    updateIPTable(data);
    const allIPs = data.map(item => item.ip);
    //read data and get all distinct IPs, and make sure they're the same ips being requested
    datasets = generateDatasets(data);
    //loop through all IPs and update the data in the chart
    const distinctIPs = [...new Set(allIPs)].sort();
    distinctIPs.forEach(ip => {
        const chart = ipList.find(item => item.ip === ip) ? ipList.find(item => item.ip === ip).chart : null;
        chart.data.labels = datasets.find(dataset => dataset.label === ip + " - " + ipList.find(item => item.ip === ip).name).times;
        chart.data.datasets = datasets.filter(dataset => dataset.label === ip + " - " + ipList.find(item => item.ip === ip).name);
        chart.update();
    });
}
function generateDatasets(data) {
    let bodyColor = "white";
    let ipsOnly = ipList.map(item => item.ip);
    const allIPs = data.map(item => item.ip).filter(ip => ipsOnly.includes(ip));
    const distinctIPs = [...new Set(allIPs)].sort();
    //create datasets for each IP
    const datasets = distinctIPs.map(ip => {
        const ipListIndex = ipList.indexOf(ipList.find(item => item.ip === ip));
        const latencies = data.filter(item => item.ip === ip).map(item => item.latency);
        const times = data.filter(item => item.ip === ip).map(item => new Date(item.time * 1000).toLocaleTimeString('en-UK', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        //get the color for each graph
        let colors = getColor(ip, latencies, bodyColor);
        const backgroundColor = colors[0];
        const borderColor = colors[1];
        bodyColor = colors[2];
        return {
            label: ip + " - " + ipList.find(item => item.ip === ip).name,
            data: latencies,
            fill: true,
            backgroundColor,
            borderColor,
            tension: 0.1,
            times
        };
    });
    document.body.style.backgroundColor = bodyColor;
    return datasets;
}
function getColor(ip, latencies, bodyColor) {
    const ipListIndex = ipList.indexOf(ipList.find(item => item.ip === ip));
    //calculate average ping and if last ping is significantly more than average, change color to orange
    const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const last3Latencies = latencies.slice(-3);
    const highLatency = last3Latencies.every(l => l - 50 > averageLatency);
    const noRes = last3Latencies.every(l => l === 0);
    //if high latency or no res, then acknowledgement is needed
    if (highLatency || noRes) {
        ipList[ipListIndex].needsAcknowledgement = true;
    }
    //if pings good then blue, if pings fail, red, if pings return but error not acknowledged, graph goes amber
    let colors = COLORS[0];
    //other colors take priority
    colors[2] = bodyColor;
    //if pings fail then red
    if (noRes || highLatency) {
        return COLORS[2]
    } else if (ipList[ipListIndex].needsAcknowledgement) {
        //if pings return but error not acknowledged, graph goes amber
        colors = COLORS[1]
        //red takes priority with background
        if (bodyColor !== "white") { colors[2] = bodyColor }
    }
    return colors
}
// Refresh every 5 seconds
setInterval(() => {
    pingIPs();
    updateChartData();
}, 5000);