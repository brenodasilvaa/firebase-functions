const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin:true});

admin.initializeApp();
require('dotenv').config();

const {SENDER_EMAIL,SENDER_PASSWORD} = process.env

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD
    }
});

 exports.sendEmail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
      
        // getting dest email by query string
        const dest = req.query.dest;
        const street = req.query.street;

        const mailOptions = {
            from: '', // Something like: Jane Doe <janedoe@gmail.com>
            to: dest,
            subject: 'Confirmação de Pedido', // email subject
            html: `Verificamos que você realizou um pedido, em breve entraremos em contato por whats/Instagram.${street}` // email content in HTML
        };

                // returning result
        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                return res.send(erro.toString());
            }
            return res.send('Sent');
        });
    });
 });
