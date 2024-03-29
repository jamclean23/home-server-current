// SERVER


// ====== IMPORTS ======

// System
const path = require('path');
const fs = require('fs');

// Express
const express = require('express');

// Dotenv
require('dotenv').config({
    path: path.join(__dirname, '../config/.env')
});

// Https
const https = require('https');
const cors = require('cors');

// Mongoose
const mongoose = require('mongoose');

// Routes
const diffusionRoute = require('./routes/diffusionRoute.js');
const downloadsRoute = require('./routes/downloadsRoute.js');

// Functions
const JobQueue = require('./functions/jobQueueFactory.js');
require('./functions/diffusionKeyStatusListener.js').init();


// ====== GLOBAL VARS / INIT ======

const HTTP_PORT = 80;
const HTTPS_PORT = 443;

const jobQueue = JobQueue([logJobAdded], [logJobCompleted]);
jobQueue.listener();


// ====== LISTENERS ====

// On app closing
// process.on('exit', exitHandler);

// On ctrl+c
// process.on('SIGINT', exitHandler);

// On nodemon restart
// process.on('SIGUSR1', exitHandler);
// process.on('SIGUSR2', exitHandler);

// On uncaught exception
// process.on('uncaughtException', exitHandler);


// ====== FUNCTIONS ======

function exitHandler (reason) {
    console.log('Handling exit: ' + reason);
    interruptAi();
    process.exit();
}

async function interruptAi () {
    const response = await fetch('http://127.0.0.1:7860/sdapi/v1/interrupt', {
        method: "POST"
    });
    const result = await response.json();
    console.log(result);
}

function startHttpServer () { 
    const app = express();
    
    app.use(cors());
    app.get('/.well-known/pki-validation/34E46AB8F586BC6409067BC8BA722B9B.txt', (req, res) => {
        res.sendFile('./cert_validation/34E46AB8F586BC6409067BC8BA722B9B.txt', { root: path.join(__dirname)}, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Sending File');
            }
        });
    })

    app.get('/*', (req, res) => {
        console.log('********************');
        console.log(`Http Request received, redirecting to https://www.server0424.lol${req.url}`);
        res.redirect(`https://server0424.lol${req.url}`);
        console.log('********************');
    });

    app.listen(HTTP_PORT, () => {
        console.log('Http Server Listening on port ' + HTTP_PORT);
    });
}

async function startHttpsServer () {
    
    // Mongoose
    try {
        await mongoose.connect(process.env.MONGO_MONGOOSE_CONNECT);
    } catch (err) {
        throw new Error(err);
    }

    // Express Setup
    const app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Middleware
    
    app.use((req, res, next) => {
        console.log('\n*** Request received ***');
        const date = new Date;
        console.log(`Date: ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} Time: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
        console.log(req.path);
        console.log('******\n');
        next()
    });
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(passGlobal(jobQueue, 'jobQueue'));
    app.use((req, res, next) => {
        console.log(req.path);
        next();
    });

    app.get('/', (req, res) => {
        res.render('serverInfo');
    });

    app.use('/diffusion', diffusionRoute);
    app.use('/download', downloadsRoute);

    https
    .createServer(
        {
            key: fs.readFileSync(path.join(__dirname, '/cert_validation/certificate', 'www_server0424_lol.key')),
            cert: fs.readFileSync(path.join(__dirname, '/cert_validation/certificate', "www_server0424_lol.crt")),
        },
        app)
    .listen(HTTPS_PORT, ()=> {
        console.log('Https Server listening on port ' + HTTPS_PORT);
    });
}

function logJobAdded () {
    console.log('Job added');
}

function logJobCompleted () {
    console.log('Job completed');
}

function passGlobal (globalVar, nameOfVar) {
    return function (req, res, next) {
        req[nameOfVar] = globalVar;
        next();
    }
}

// ====== MAIN ======

startHttpServer();
startHttpsServer();
