const dotenv = require('dotenv/config');
const express = require("express");
const ping = require("ping");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

//format for ping results should be [{ip:8.8.8.8, latency: 10, time: 1740841532}] where time is in unix timestamp, latency is in ms and ip is the ip address of the server
let pingResults = [];

// Ping function that updates results
const pingIPs = async (ips) => {
    for (let ip of ips) {
        const res = await ping.promise.probe(ip);
        let pingResult = {
            "ip": ip,
            "latency": res.alive ? res.time : 0,
            "time": Math.floor(Date.now() / 1000)
        }
        //remove results older than 15 minutes
        if (pingResults != null) { pingResults = pingResults.filter((result) => result.time + 900 > Date.now() / 1000) }
        pingResults.push(pingResult);
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
    res.json(pingResults);
});
app.get("/", (req, res) => {
    //send index.html
    res.sendFile(__dirname + "/index.html");
});
app.get("/pingometer.js", (req, res) => {
    //send pingometer.js
    res.sendFile(__dirname + "/pingometer.js");
}
);
app.get("/weather.js", (req, res) => {
    //send weather.js
    res.sendFile(__dirname + "/weather.js");
}
);
app.get("/a2it-logo.png", (req, res) => {
    //send a2it-logo.png
    res.sendFile(__dirname + "/a2it-logo.png");
}
);
app.get("/styles.css", (req, res) => {
    //send style.css
    res.sendFile(__dirname + "/styles.css");
}
);
app.get("/weatherKey", (req, res) => {
    const wunderground = process.env.WUNDERGROUND
    if (!wunderground) {
        res.json({ key: "" })
    }
    res.json({ key: wunderground })
})
app.listen(3000, () => console.log("Server running on port 3000"));