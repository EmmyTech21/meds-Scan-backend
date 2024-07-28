const express = require('express');
const router = express.Router();
const Report = require('../models/Report'); 
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create a new report
router.post('/', async (req, res) => {
  const { name, email, phoneNumber, message, image } = req.body;

  try {
    const newReport = new Report({ name, email, phoneNumber, message, image });
    await newReport.save();

    // Send email notification to the user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Fake Product Report Received',
      text: `Hello ${name},\n\nThank you for reporting a fake product. We have received your report and will take appropriate action.\n\nBest regards,\nMedScan Team`,
    };

    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send('Error sending email to user');
      } else {
        console.log('User email sent: ' + info.response);
      }
    });

    // Send email notification to yourself
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Your email address
      subject: 'New Fake Product Report Submitted',
      text: `A new fake product report has been submitted:\n\nName: ${name}\nEmail: ${email}\nPhone Number: ${phoneNumber}\nMessage: ${message}\n\nBest regards,\nYour Application`,
    };

    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send('Error sending email to admin');
      } else {
        console.log('Admin email sent: ' + info.response);
        res.status(200).send('Report received and emails sent');
      }
    });

  } catch (error) {
    res.status(400).send(error);
  }
});


// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).send(reports);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
