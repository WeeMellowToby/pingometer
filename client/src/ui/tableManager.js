import { calculateAverage } from "../utils/mathFuncs.js";

export function renderTableHTML(ipList) {
    const tableHead = `<tr>
            <th>IP</th>
            <th>Name</th>
            <th>Status</th>
            <th>Average Ping /ms</th>
            <th>Latest Ping /ms</th>
            <th></th>
        </tr>`;
    const tableBody = renderTableBodyHTML(ipList);
    const tableHTML = tableHead + tableBody;
    return tableHTML;

}
function renderTableBodyHTML(ipList) {
    let body = '';
    for (let i = 0; i < ipList.length; i++) {
        const item = ipList[i];
        const latencies = item.latencies.map((l) => l.latency);
        const average = calculateAverage(latencies);
        const latestPing = latencies[latencies.length - 1];
        body += '<tr>' + renderRowHTML(item.ip, item.ipName, average, latestPing) + '</tr>';
    }
    return body;
}
function renderRowHTML(ip, name, avgPing, latestPing) {
    const rowHTML = `<td>${ip} </td> 
        <td>${name}</td>
        <td>${latestPing != 0 ? "Online" : "Offline"}</td>
        <td>${Math.round(avgPing)}</td>
        <td>${latestPing}</td>
        <td><button onclick="removeIP('${ip}')" class="removeButton">&#10006;</button></td>`;
    return rowHTML;
}