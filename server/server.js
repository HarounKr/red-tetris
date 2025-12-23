const express = require('express');
const app = express();
const path = require('path')
const port = process.env.PORT || 8000;
const env = process.env.NODE_ENV;

console.log('Server starting in ' + env + ' mode');
if (env === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
} else {
    app.get('/', (req, res) => {
        res.send('Development mode: no static files served');
    });
}

app.get('/api/health', (req, res) => {
    res.send('OK');
    console.log('Health check OK');
});

app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(port, () => {
    console.log('Server app listening on port ' + port);
});
