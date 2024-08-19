const https = require('https');
const fs = require('fs');

const options = {
    hostname: 'localhost',
    port: 7054,
    path: '/correct/path', // Update this to the correct path
    method: 'GET',
    rejectUnauthorized: false, // This is for testing purposes only. Do not use in production.
    secureProtocol: 'TLSv1_2_method', // Force TLS version
    // Uncomment and provide paths to your certificate and key if needed
    // key: fs.readFileSync('path/to/your/key.pem'),
    // cert: fs.readFileSync('path/to/your/cert.pem')
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('socket', (socket) => {
    socket.on('secureConnect', () => {
        console.log('TLS connection established');
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    console.error(e);
});

req.end();