const express = require('express');
const server = express();
const path = require('path');
const { send } = require( 'process' );

const PORT = process.env.PORT || 3000

// server.use(express.static(path.join(__dirname, 'bf-debug')));
// server.use(express.static(path.join(__dirname, 'rate-tuner')));
// server.use(express.static(path.join(__dirname, 'rotor-pirates')));
server.use(express.static(path.join(__dirname, 'src')));

server.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'bf-debug/main.html'));    
    // res.sendFile(path.join(__dirname, 'rate-tuner/index.html'));    
    // res.sendFile(path.join(__dirname, 'rotor-pirates/index.html'));    
    res.sendFile(path.join(__dirname, 'src/index.html'));    
});

server.listen(PORT);
console.log('Server started at http://localhost:' + PORT);