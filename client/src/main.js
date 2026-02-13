import { save, state, updateNeedsAcknowledgement } from "./utils/state.js";
import { IP_REGEX } from "./constants/config.js";
import { renderTableHTML } from "./ui/tableManager.js";
import { fetchPingData, pingIPs } from "./api/pingApi.js";
import { recreateCharts, updateCharts } from "./ui/chartManager.js";
import { getBodyColor } from "./utils/colors.js";
// Load saved IPs when the page loads
window.onload = async function () {
    await refreshData();
    updateNeedsAcknowledgement();
    renderUI(true);
    save();
};
async function refreshData() {
    const data = await fetchPingData();
    AddPingDataToIPList(data);
}
function renderUI(recreate = false) {
    if (recreate) {
        recreateCharts();
    }
    updateCharts();
    document.getElementById("ipList").innerHTML = renderTableHTML(state.IPList);
}
// Add an IP to the list
function addIP() {
    const ip = document.getElementById("ipInput").value.trim();
    // check if IP matches the ip regex
    if (!ip.match(IP_REGEX)) {
        alert("Invalid IP address");
        return;
    }
    const name = document.getElementById("nameInput").value.trim();
    const item = { ip: ip, ipName: name };
    if (ip && !state.IPList.includes(item)) {
        state.IPList.push(item);
        renderUI(true);
        save();
    }
    document.getElementById("ipInput").value = "";
    document.getElementById("nameInput").value = "";
}

function removeIPFromState(ip) {
    state.IPList = state.IPList.filter(item => item.ip !== ip);
}
function removeIP(ip) {
    removeIPFromState(ip);
    renderUI(true);
    save();
}

function AddPingDataToIPList(data) {
    for (let i = 0; i < state.IPList.length; i++) {
        state.IPList[i].latencies = [];
    }
    for (let i = 0; i < data.length; i++) {
        const dataItem = data[i];
        const ipListItem = state.IPList.find((element) => element.ip == dataItem.ip);
        if (!ipListItem) continue;
        ipListItem.latencies.push({ latency: dataItem.latency, time: dataItem.time });
    }
}
// Refresh every 5 seconds
setInterval(async () => {
    await pingIPs(state.IPList.map(i => i.ip));
    await refreshData();
    updateNeedsAcknowledgement();
    renderUI();
    document.body.style.backgroundColor = getBodyColor();
}, 5000);

// Expose functions to global scope for onclick handlers
window.addIP = addIP;
window.removeIP = removeIP;
