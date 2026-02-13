export const IP_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
export const chartHeight = 150;
export const chartWidth = 200;
export const COLORS = [
    ["rgba(0,0,139,0.2)", "rgb(0, 0, 139)", "white"],
    ["rgba(249, 105, 14,0.2)", "rgb(249, 105, 14)", "orange"],
    ["rgba(255, 0, 0,0.5)", "rgb(255, 0, 0)", "darkred"]
];
export const defaultState = {
    saveVersion: "V1",
    weatherID: "IBUNTI22",
    IPList: [
        {
            ip: "127.0.0.1",
            ipName: "localhost"
        },
        {
            ip: "8.8.8.8",
            ipName: "Google DNS"
        }
    ]
};
export const CHART_OPTIONS = {
    elements: {
        point: {
            radius: 0
        }
    },
    scales: {
        x: {
            display: false,
        },
        y: {
            title: {
                display: false,
            },
            grid: {
                display: false,
            },
        }
    },
    animation: false, // Disable animation
    plugins: {
        legend: {
            labels: {
                boxWidth: 0
            }
        }
    }
};