# Pingometer

## A simple Node.js tool for monitoring device uptime and response times.

This project was built with html5, css and vanilla js for the front end with node js used on the backend. It is used to monitor the response times and the uptime of devices on the same network as the server.

## Features

* Track response times
* Easy configuration
* View weather with wunderground

## Installation

```bash
npm install
```
### &nbsp; wunderground api key
&nbsp; Then add a .env file with your wunderground api key as the variable ```WUNDERGROUND```
## Usage

```bash
node index.js
```


## Docker

To pull the Docker image:

```bash
docker pull weemellowtoby/pingometer
```
To run the container:

```bash
docker run -d --name pingometer -p 3000:3000  -e WUNDERGROUND=YOUR_API_KEY_HERE weemellowtoby/pingometer
```


## License

MIT