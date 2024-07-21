// 1. npm init -y
// 2. npm i express
// 3. npm i --save-dev nodemon
// 4. "scripts": {"dev": "nodemon server.js"

const express = require('express');
const server = express();
const path = require('path');
const { send } = require( 'process' );

const PORT = process.env.PORT || 3000

server.use(express.static(path.join(__dirname, 'public')));

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));    
});

server.listen(PORT);
console.log('Server started at http://localhost:' + PORT);