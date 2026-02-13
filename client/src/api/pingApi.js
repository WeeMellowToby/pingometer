import { state } from "../utils/state.js";
export async function fetchPingData() {
    const response = await fetch(window.location.href + "results");
    const data = await response.json();
    return data;
}
// Ping the saved IPs
export async function pingIPs(ips) {
    if (state.IPList.length === 0) return;
    await fetch(window.location.href + "ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ips })
    });
}