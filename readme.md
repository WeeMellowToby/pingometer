# Pingometer

A simple Node.js tool for monitoring device uptime and response times.

## Features

- Track response times
- Easy configuration
- View weather with wunderground

## Installation

```bash
npm install
```

## Docker

To pull the Docker image:

```bash
docker pull weemellowtoby/pingometer
```

## Usage

```bash
node index.js
```
To run the container:

```bash
docker run -d --name pingometer -p 3000:3000  -E wunderground=YOUR_API_KEY_HERE weemellowtoby/pingometer
```

## License

MIT