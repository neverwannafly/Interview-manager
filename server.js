const express = require('express');
const path = require('path');

const port = process.env.PORT || 3000;
const mongoose = require('mongoose');

// local imports
const db = require('./keys').mongoURI;

// Setup MongoDB
mongoose.connect(db, {
    useNewUrlParser: true
}).then(() => {
    console.log('MongoDB Connected')
}).catch(err => {
    console.log(err);
});

const app = express();

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/modules', express.static(path.join(__dirname, 'node_modules')));
app.set('view engine', 'pug');

const users = require('./routes/users');
const interview = require('./routes/interview');

app.use('/api/user', users);
app.use('/api/interview', interview);

app.get('/', (req, res)=> {
    res.render('index', {
        title: 'interview scheduler',
    });
});

app.listen(port, () => 
    console.log(`running on localhost:${port}`)
);