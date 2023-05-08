const express = require('express');
const app = express();
const dbConnect = require('./database/index');
const {PORT}  = require('./config/index');




app.get('/', (req, res) => {
    res.json({msg: 'Hello World'})
});

app.listen(PORT, () => {
    dbConnect();
    console.log(`Backend is running on port: ${PORT}`);
});