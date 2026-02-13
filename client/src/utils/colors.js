import { COLORS } from "../constants/config.js";
import { getIPStatus, ipStatusCodes, state } from "./state.js";

export function getChartColors(ipItem) {
    if (ipItem.latencies.length < 3) {
        return COLORS[0];
    }
    return COLORS[getIPStatus(ipItem)];
}
export function getBodyColor() {
    let bodyColor = COLORS[0][2];
    for (let i = 0; i < state.IPList.length; i++) {
        let ipItem = state.IPList[i];
        const ipStatus = getIPStatus(ipItem);
        if (ipStatus === ipStatusCodes.DOWN) {
            return COLORS[2][2];
        }
        if (ipStatus === ipStatusCodes.NEEDS_ACKNOWLEDGEMENT) {
            bodyColor = COLORS[1][2];
        }
    }
    return bodyColor;
}