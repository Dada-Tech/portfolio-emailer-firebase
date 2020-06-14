const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const serviceAccount = require('./.serviceAccountKey.json');
const app = express();
const cors = require('cors');
const https = require('https');
const Joi = require('@hapi/joi');

// firebase init
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://portfolio-emailer.firebaseio.com"
});
let db = admin.firestore();

// express middleware
app.use(express.json());

// cors middleware
const originsWhitelist = ['https://daviddada.com','https://dadadavid.com','http://localhost:4200','http://127.0.0.1:4200'];
const corsOptions = {
    origin: function(origin, callback) {
        const isWhitelisted = originsWhitelist.includes(origin);
        callback(null, isWhitelisted);
    },
    "optionsSuccessStatus": 200,
    "Access-Control-Allow-Methods":"GET, PUT, POST, DELETE, HEAD, OPTIONS",
    "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, Authorization",
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Credentials": true
};

app.use(cors(corsOptions));

// Joi input validation middleware
inputValidation = function(request, response, next) {
    // input validation
    const schema = Joi.object().keys({
        name: Joi.string().min(3).required(),
        email: Joi.string().min(3).required(),
        subject: Joi.string().min(3).required(),
        message: Joi.string().min(3).required(),
        recaptcha: Joi.string()
    });

    const result = Joi.validate(request.body,schema);
    if(result.error) {
        return response.status(400).send({"responseMsg": result.error.message});
    } else {
        return next();
    }
};

// captcha middleware
captchaVerify = function(request, response, next) {
    // verify recaptcha
    if (request.body.recaptcha === undefined || request.body.recaptcha === '' || request.body.recaptcha === null) {
        return response.status(400).send({"responseMsg": "Captcha undefined"});
    }

    const verificationURL = `https://recaptcha.google.com/recaptcha/api/siteverify?secret=${functions.config().captcha.secretkey}&response=${request.body.recaptcha}&remoteip=${request.connection.remoteAddress}`;

    https.get(verificationURL, (resG) => {
        let rawData = '';
        resG.on('data', (chunk) => { rawData += chunk });
        resG.on('end', () => {
            try {
                let parsedData = JSON.parse(rawData);
                if (parsedData.success === true) {
                    return next();
                } else {
                    return response.status(400).send({"responseMsg": "Captcha verification Failure"});
                }
            } catch (e) {
                return response.status(400).send({"responseMsg": "Captcha error"});
            }
        });
    });
    return true;
};

app.get('/test', (request,response) => {
    return response.status(200).send(functions.config().firebase);
});

// mail POST
app.post('/mail', inputValidation, captchaVerify, (request,response) => {
    // db upload
    db.collection("mail").add({
        created: admin.firestore.FieldValue.serverTimestamp(),
        name: request.body.name,
        email: request.body.email,
        subject: request.body.subject,
        message: request.body.message
    })
        .then(() => {
            return response.status(200).send({"responseMsg": "successfully added to database"});
        })
        .catch((error) => {
            console.error(error.toString());
            return response.status(501).send({"responseMsg": "database error"});
        });
});

exports.app = functions.https.onRequest(app);
