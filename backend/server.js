const express = require('express');
const app = express();
const dbConnect = require('./database/index');
const {PORT}  = require('./config/index');
const cookieParser = require('cookie-parser');

const router = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');

app.use(cookieParser());
app.use(express.json())

app.use(router);

app.get('/', (req, res) => {
    res.json({msg: 'Hello World'})
});

app.use(errorHandler)
app.listen(PORT, () => {
    dbConnect();
    console.log(`Backend is running on port: ${PORT}`);
});