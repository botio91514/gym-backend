const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Server is running and responding!');
    
    res.on('data', (chunk) => {
        console.log(`Response: ${chunk}`);
    });
});

req.on('error', (error) => {
    console.error('Error connecting to server:', error.message);
    console.log('\nTo fix this:');
    console.log('1. Make sure the server is running (node server.js)');
    console.log('2. Check if port 3000 is available');
    console.log('3. Verify your firewall settings');
});

req.end(); 