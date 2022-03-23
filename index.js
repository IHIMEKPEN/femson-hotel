// To connect with your mongoDB database
const mongoose = require('mongoose');

mongoose.connect(
    'mongodb+srv://hotelbooking-db:droptop@cluster0.sw2l8.mongodb.net/hotelbooking-db?retryWrites=true&w=majority',
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
const sendmail = require('./mail');


const app = express();
app.use(express.json());
app.use(cors());
// app.use(bodyParser.json());
app.use('/static', express.static('static'))//load static files



const nodemailer = require('nodemailer');
require("dotenv").config();//to use environmental variables

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
//available rooms
let availableRoom={
    first_class:[1,2,3,4],
    second_class:[5,6,7,8],
    third_class:[9,10]
}

// Register data to book hotelroom
app.post('/register', async (req, resp) => {
    try {
        const user = new RoomBooked(req.body);
        let result = await user.save();
        result = result.toObject();
        if (result) {
            delete result.password;
            resp.send(req.body);
            console.log(result);

            const mailConfigurations = {

                // It should be a string of sender email
                from: `${process.env.EMAIL_USERNAME}`,
            
                // Comma Separated list of mails
                to: 'oihimekpen@gmail.com',
            
                // Subject of Email
                subject: `Room Booking Successful at Femson Hotel`,
            
                // This would be the text of email body
                text: `Your room no is ${req.body.roomNo}, `
                    + 'Lodge out time is 12 noon(12pm), '
                    + `Enjoy your stay ${req.body.name}  `
            };

            transporter.sendMail(mailConfigurations, function (error, info) {
                if (error) {throw Error(error);
                }else{
            
               
                console.log('Email Sent Successfully');
                console.log(info);
             }
            });
            
            
            
        } else {
            console.log('User already register');
        }
    } catch (err) {
        resp.send('Something Went Wrong'+err);
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



// Server setup
app.listen(5000, () => {
    console.log('App listen at port 5000');
});
