let ipList = [];

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

// Function to update the displayed list of IPs
function updateIPList() {
    const ipListDOM = document.getElementById("ipList");
    ipListDOM.innerHTML = ""; // Clear existing list
    ipList.forEach(ip => {
        const listItem = document.createElement("li");
        listItem.id = `status-${ip.ip}`;
        listItem.innerHTML = `${ip.ip} (${ip.name})<button onclick="removeIP('${ip.ip}')">❌</button>`;
        ipListDOM.appendChild(listItem);
    });
    updateChart();
}

// Add an IP to the list
function addIP() {
    const ip = document.getElementById("ipInput").value.trim();
    // check if IP matches the regex ^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$
    if (!ip.match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/)) {
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
    const allIPs = data.map(item => item.ip);
    const distinctIPs = [...new Set(allIPs)].sort();
    //read data and get all distinct IPs, and make sure they're the same ips being requested
    datasets = generateDatasets(data);

    //create a canvas with a chart for each IP address in the div with id "charts"
    //charts need to be 500 long and 300 high, with time on the x-axis and latency on the y-axis
    const chartsDiv = document.getElementById("charts");
    chartsDiv.style.display = "flex"; // Set display to flex
    chartsDiv.style.flexWrap = "wrap"; // Allow wrapping to the next line if necessary
    let scrollPosition = window.scrollY;
    chartsDiv.innerHTML = "";

    distinctIPs.forEach(ip => {
        const canvasContainer = document.createElement("button");
        canvasContainer.className = "chartButton";
        canvasContainer.onclick = function () {
            ipList[ipList.indexOf(ipList.find(item => item.ip === ip))].acknowledged = true;
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
                labels: datasets.find(dataset => dataset.label === ip + " (" + ipList.find(item => item.ip === ip).name + ")").times,
                datasets: datasets.filter(dataset => dataset.label === ip + " (" + ipList.find(item => item.ip === ip).name + ")")
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
        ipList[ipList.indexOf(ipList.find(item => item.ip === ip))].chart = chart;
    });
    window.scrollTo(0, scrollPosition);
}
async function updateChartData() {
    const response = await fetch(window.location.href + "results");
    const data = await response.json();
    const allIPs = data.map(item => item.ip);
    //read data and get all distinct IPs, and make sure they're the same ips being requested
    datasets = generateDatasets(data);
    //loop through all IPs and update the data in the chart
    const distinctIPs = [...new Set(allIPs)].sort();
    distinctIPs.forEach(ip => {
        const chart = ipList.find(item => item.ip === ip).chart;
        chart.data.labels = datasets.find(dataset => dataset.label === ip + " (" + ipList.find(item => item.ip === ip).name + ")").times;
        chart.data.datasets = datasets.filter(dataset => dataset.label === ip + " (" + ipList.find(item => item.ip === ip).name + ")");
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
        //calculate average ping and if last ping is significantly more than average, change color to orange
        const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        let last3Latencies = latencies.slice(-3);
        let highLatency = true;
        let noRes = true;
        for (let i = 0; i < last3Latencies.length; i++) {
            if (last3Latencies[i] - 50 < averageLatency) {
                highLatency = false;
            }
            if (last3Latencies[i] != 0) {
                noRes = false;

            }
        }
        if ((noRes || highLatency) && !ipList[ipListIndex].acknowledged) {
            console.log(ipList[ipListIndex].acknowledged);
            console.log("setting body color to red");
            bodyColor = "darkred";
        } else if (noRes || highLatency && bodyColor === "white") {
            bodyColor = "orange";
        }
        if (!noRes && !highLatency) { ipList[ipListIndex].acknowledged = false; }
        let acknowledged = ipList[ipListIndex].acknowledged;
        const backgroundColor = noRes && !acknowledged ? `rgba(255, 0, 0,0.5)` : !highLatency || acknowledged ? `rgba(0,0,139,0.2)` : `rgba(249, 105, 14,0.2)`; // Dark blue with transparency or orange if last ping is significantly more than average
        const borderColor = noRes && !acknowledged ? `rgb(255, 0, 0)` : !highLatency || acknowledged ? `rgb(0, 0, 139)` : `rgb(249, 105, 14)`; // Dark blue or orange if last ping is significantly more than average
        return {
            label: ip + " (" + ipList.find(item => item.ip === ip).name + ")",
            data: latencies,
            fill: true,
            backgroundColor,
            borderColor,
            tension: 0.1,
            times
        };
    });
    console.log(bodyColor);
    console.log(ipList)
    document.body.style.backgroundColor = bodyColor;
    return datasets;
}
// Refresh every 5 seconds
setInterval(() => {
    pingIPs();
    updateChartData();
}, 5000);