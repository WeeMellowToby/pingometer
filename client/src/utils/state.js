import { defaultState } from "../constants/config.js";
import { calculateAverage } from "./mathFuncs.js";

export const ipStatusCodes = Object.freeze({
    UP: 0,
    NEEDS_ACKNOWLEDGEMENT: 1,
    DOWN: 2
});

export const state = load();

export function createIP(ip, name) {
    return {
        ip,
        ipName: name,
        latencies: [],
        chart: null,
        needsAcknowledgement: false
    };
}

export function getIP(ip) {
    return state.ipList.find(item => item.ip === ip);
}
export function getIPStatus(ipListItem) {
    const latencies = ipListItem.latencies.map((l) => l.latency);
    const averageLatency = calculateAverage(latencies);
    const last3Latencies = latencies.slice(-3);
    const highLatency = last3Latencies.every(l => l - 50 > averageLatency);
    const noRes = last3Latencies.every(l => l === 0);
    if (highLatency || noRes) {
        return ipStatusCodes.DOWN;
    }
    if (ipListItem.needsAcknowledgement) {
        return ipStatusCodes.NEEDS_ACKNOWLEDGEMENT;
    }
    return ipStatusCodes.UP;
}
export function updateNeedsAcknowledgement() {
    for (let i = 0; i < state.IPList.length; i++) {
        const ipListItem = state.IPList[i];
        if (getIPStatus(ipListItem) === ipStatusCodes.DOWN) {
            ipItem.needsAcknowledgement = true;
        }
    }
}
function load() {
    let data = localStorage.getItem("pingometerData");
    data = data ? JSON.parse(data) : defaultState;
    for (let i = 0; i < data.IPList.length; i++) {
        data.IPList[i] = createIP(data.IPList[i].ip, data.IPList[i].ipName);
    }
    return data;

}

export function save() {
    const saveData = {
        saveVersion: "V1",
        weatherID: state.weatherID,
        IPList: []
    };
    for (let i = 0; i < state.IPList.length; i++) {
        saveData.IPList.push({ ip: state.IPList[i].ip, ipName: state.IPList[i].ipName });
    }
    localStorage.setItem("pingometerData", JSON.stringify(saveData));
}