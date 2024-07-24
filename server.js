require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

const emailSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    subscribedAt: { type: Date, default: Date.now }
});

const Email = mongoose.model('Email', emailSchema);

// Configure of the email transport using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
console.log(transporter);

// Endpoint to handle email subscriptions
app.post('/subscribe', async (req, res) => {
    const email = req.body.email;
    console.log(email);

    // Check if the email already exists in the database
    try {
        const existingEmail = await Email.findOne({ email });
        if (existingEmail) {
            return res.status(400).send({ message: `Your email is already on our list, eagerly awaiting our grand reveal.` });
        }
    } catch (error) {
        console.error('Hmm... Our digital gears are grinding a bit.', error);
        return res.status(500).send({ message: 'Hmm... Our digital gears are grinding a bit.', error });
    }

    // Saving the email to the database
    const newEmail = new Email({ email });
    try {
        await newEmail.save();
    } catch (error) {
        console.error('Error saving email to database:', error);
        return res.status(500).send({ message: 'Oops! Our digital mailbox is having a moment.', error });
    }

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Woohoo! You're in the loop! 🎉`,
        text: `Dear Honored Patron,
        Thank you for your interest in Sthaniya Saathi. We're thrilled to have you join our community of early supporters.
        We're working hard to bring you an exceptional experience, and we can't wait to share it with you. Your email just got the VIP treatment and is now nestled comfortably in our database. Consider yourself part of our inner circle of soon-to-be-wowed individuals.
        What's next?
        1. Pat yourself on the back for making an excellent decision.
        2. Keep an eye on your inbox – we'll be sliding into your email with some exciting updates soon.
        3. Maybe do a little happy dance? (We won't tell anyone.)
        While we put the finishing touches on our big reveal, feel free to daydream about all the awesome things coming your way.
        Thanks for joining us on this adventure. We're thrilled to have you aboard!
        
        Stay curious,
        The Sthaniya Saathi Team`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send({ message: 'Error sending email', error });
        }
        res.status(200).send({ message:`Woohoo! You're in the loop! 🎉` });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
