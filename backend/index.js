require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./connectDB');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/', urlRoutes);

// Express 5 forwards errors from async handlers here
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
