const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const fs = require('fs');
const ical = require('ical-generator');
require('dotenv').config();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')


const pool = require('../mysql');

pool.query('SELECT 1 + 1', (err, rows) => {
  if (err) {
    console.error('Query error:', err);
    return;
  }
});

function replaceTemplate(template, values) {
  let output = template;
  for (let key in values) {
    console.log(values)
      output = output.replace(new RegExp('{{' + key + '}}', 'g'), values[key]);
  }
  return output;
}

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'loris@myvibe.is',
      pass: 'bhcl pnyq pjwk wrqm'
  }
});

router.post('/send-notification', (req, res) => {
  fs.readFile('./templates/template_email_notifications.html', 'utf8', (err, htmlTemplate) => {
      if (err) {
          console.error('Errore durante la lettura del file template:', err);
          return res.status(500).send('Errore interno del server');
      }

      const html = replaceTemplate(htmlTemplate, {
          //subject: req.body.subject,
          //message: req.body.text

          subject: "Hey",
          message: "This is Loris"
      });

      let mailOptions = {
          from: 'loris@myvibe.is',
          to: 'loriscaputo17@gmail.com',
          //to: req.body.to,
          subject: req.body.subject,
          html: html
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error('Errore durante l\'invio dell\'email:', error);
              return res.status(500).send('Errore durante l\'invio dell\'email: ' + error.toString());
          }
          console.log('Email inviata: %s', info.messageId);
          res.status(200).send('Email inviata con successo: ' + info.response);
      });
  });
});

router.post('/test', (req, res) => {
  const msg = {
    to: 'loriscaputo17@gmail.com',
    from: 'dev@myvibe.is',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
});

router.post('/send-calendar', (req, res) => {
  const calendar = ical();

  // Aggiunge un evento al calendario
  calendar.createEvent({
      start: new Date(2024, 0, 1, 10, 0),
      end: new Date(2024, 0, 1, 12, 0),
      summary: 'Riunione di Team',
      description: 'Riunione di inizio anno per discutere gli obiettivi e i piani del team per il 2024.'
  });

    let mailOptions = {
        from: 'loris@myvibe.is',
        //to: req.body.to,
        //subject: req.body.subject,
        //text: req.body.text,
        to: 'loriscaputo17@gmail.com',
        subject: 'Ciao',
        text: 'Ciao',
        icalEvent: {
            filename: 'evento.ics',
            method: 'request',
            content: calendar.toString()
        }
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.status(200).send('Email con calendario inviata: ' + info.response);
    });
});

module.exports = router;
