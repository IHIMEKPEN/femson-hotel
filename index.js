
require("dotenv").config();//to use environmental variables

// To connect with your mongoDB database
const mongoose = require('mongoose');
const axios = require('axios');

mongoose.connect(
    process.env.DB,
    {
        dbName: 'hotelbooking-db',
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err) => (err ? console.log(err) :
        console.log('Connected to hotelbooking-db database')),
);

// Schema for hotel Booking
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    roomNo: {
        type: String,
        required: true,
    },
    package: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const RoomBooked = mongoose.model('users', UserSchema);
RoomBooked.createIndexes();

// For backend and express
const express = require('express');
const cors = require('cors');
// const sendmail = require('./mail');
const request = require('request');
// const { initializePayment, verifyPayment } = require('./paystack')(request);

const app = express();
app.use(express.json());
app.use(cors());
// app.use(bodyParser.json());
app.use('/static', express.static('static'))//load static files



const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: `${process.env.EMAIL_USERNAME}`,
        pass: `${process.env.PASSWORD}`
    }
});

app.get('/', (req, resp) => {
    resp.sendFile(__dirname + "/index.html");
});
app.get('/bookroom', (req, resp) => {
    resp.sendFile(__dirname + "/bookroom.html");
});
app.get('/paynow', (req, resp) => {
    resp.sendFile(__dirname + "/paynow.html");
});

//available rooms
let availableRoom = {
    first_class: [1, 2, 3, 4],
    second_class: [5, 6, 7, 8],
    third_class: [9, 10]
}
const bodyParser = require("body-parser");

app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: true });

// Register data to book hotelroom
app.post('/register', urlencodedParser, async (req, resp) => {
    //try the follow if not okay catch handles it
    try {
        const user = new RoomBooked(req.body);
        let result = await user.save();
        result = result.toObject();
        if (result) {
            delete result.password;
            // resp.send(req.body);

            // console.log(result);

          
            // resp.redirect('/pay');
            const mailConfigurations = {

                // It should be a string of sender email
                from: `${process.env.EMAIL_USERNAME}`,
    
                // Comma Separated list of mails
                to: `${req.body.email}`,
    
                // Subject of Email
                subject: `Room Booking Successful at Femson Hotel`,
    
                // This would be the text of email body
                text: `Your room no is ${req.body.roomNo}, `
                    + 'Lodge out time is 12 noon(12pm), '
                    + `Enjoy your stay in our "${req.body.package}" ${req.body.name}  `
            };
    
            transporter.sendMail(mailConfigurations, function (error, info) {
                if (error) {
                    throw Error(error);
                } else {
    
    
                    console.log('Email Sent Successfully');
    
                    // console.log(info);
                }
            });


        } else {
            console.log('User already register');
        }
    } catch (err) {
        resp.send('Something Went Wrong' + err);
    }
});

// Getting roombooked details
app.get('/get-room-data', async (req, resp) => {
    try {
        const details = await RoomBooked.find({});
        resp.send(details);
    } catch (error) {
        console.log(error);
    }
});



const MySecretKey = `"Bearer ${process.env.PAYSTACK_API_KEY}"`;



app.get('/payment/verify', async (req, res) => {

    const ref = req.query.reference;
    let output;
    await axios.get(`https://api.paystack.co/transaction/verify/${ref}`, {
        headers: {
            authorization: MySecretKey,
            //replace TEST SECRET KEY with your actual test secret 
            //key from paystack
            "content-type": "application/json",
            "cache-control": "no-cache",
        },
    }).then((success) => {
        output = success;
    }).catch((error) => {
        output = error;
    });
    //now we check for internet connectivity issues
    if (!output.response && output.status !== 200) { throw  Error("No internet Connection"+error); }
    //next,we confirm that there was no error in verification.
    // if (output.response && !output.response.data.status) {
    //     throw Error("Error verifying payment , 'unknown Transaction    Reference Id'");

    // } 
    else {
        //we return the output of the transaction
        res.status(200).send("Payment was successfully verified");
        
    }

});



// Server setup
app.listen(process.env.PORT || 5000, () => {
    console.log(`App listen at port ${process.env.PORT}`);
});
