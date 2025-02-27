const express = require("express");
const ping = require("ping");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let pingResults = {};

// Ping function that updates results
const pingIPs = async (ips) => {
    for (let ip of ips) {
        const res = await ping.promise.probe(ip);
        if (!pingResults[ip]) pingResults[ip] = [];
        pingResults[ip].push(res.time); // Store ping time
        if (pingResults[ip].length > 10) pingResults[ip].shift(); // Keep last 10 pings
    }
};

// API endpoint to start pinging
app.post("/ping", async (req, res) => {
    const { ips } = req.body;
    await pingIPs(ips);
    res.json({ success: true });
});

// API endpoint to get average ping times
app.get("/results", (req, res) => {
    const averages = {};
    for (let ip in pingResults) {
        let times = pingResults[ip].filter(t => t !== "unknown"); // Filter bad results
        let avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
        averages[ip] = avg;
    }
    res.json(averages);
});
app.get("/", (req, res) => {
    //send index.html
    res.sendFile(__dirname + "/index.html");
});

app.listen(3000, () => console.log("Server running on port 3000"));