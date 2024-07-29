const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Create a new report
router.post('/', async (req, res) => {
  const { name, email, phoneNumber, message, image } = req.body;

  try {
    let imageName = null;

    if (image) {
      // Decode base64 image
      const buffer = Buffer.from(image, 'base64');
      imageName = `${Date.now()}.jpg`;
      const imagePath = path.join(uploadsDir, imageName);

      // Save image to the server
      fs.writeFileSync(imagePath, buffer);
    }

    const newReport = new Report({ name, email, phoneNumber, message, image: imageName });
    await newReport.save();

    // Send email notification to the user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Fake Product Report Received',
      text: `Hello ${name},\n\nThank you for reporting a fake product. We have received your report and will take appropriate action.\n\nBest regards,\nMedScan Team`,
    };

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Fake Product Report Submitted',
      text: `A new fake product report has been submitted:\n\nName: ${name}\nEmail: ${email}\nPhone Number: ${phoneNumber}\nMessage: ${message}\n\nBest regards,\nYour Application`,
    };

    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    res.status(200).send('Report received and emails sent');
  } catch (error) {
    console.error('Error during report submission:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).send(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
