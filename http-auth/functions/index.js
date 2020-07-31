/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({ origin: true });
const app = express();
const nodemailer = require('nodemailer');
require('dotenv').config();
const Correios = require('node-correios');

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD
  }
});

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res, next) => {
  console.log('Check if request is authorized with Firebase ID token');

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.');
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
    return;
  }
};

app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.get('/hello', (req, res) => {
  res.send(JSON.stringify(req.user));
});

// This HTTPS endpoint can only be accessed by your Firebase Users.
// Requests need to be authorized by providing an `Authorization` HTTP header
// with value `Bearer <Firebase ID Token>`.
exports.app = functions.https.onRequest(app);

app.get('/sendMail', (req, res) => {
  const dest = req.query.dest;
  const name = req.query.name;
  const phone = req.query.phone;
  const email = req.query.email;
  const zipCode = req.query.zipCode;
  const model = req.query.model;
  const course = req.query.course;
  const courseOnPJ = req.query.courseOnPJ;
  const university = req.query.university;
  const product = req.query.product;
  const doll = req.query.doll;
  const city = req.query.city;
  const state = req.query.state;
  const number = req.query.number;
  const neighbourhood = req.query.neighbourhood;
  const street = req.query.street;
  const color = req.query.color;
  const instagram = req.query.instagram;
  const background = req.query.background;
  const dollHair = req.query.dollHair;

  const mailOptions = {
    from: 'Porta Jalecos Personalizados <portajalecospersonalizados@gmail.com>',
    to: [dest, 'portajalecospersonalizados@gmail.com'],
    subject: 'Confirmação de Pedido',
    html: `<h1> Muito Obrigada!</h1>
          <p> Verificamos que você realizou um pedido, em breve entraremos em contato por Whatsapp/Instagram.</p>
          <p> Email: ${email}</p>
          <p> Nome: ${name}</p>
          <p> Instagram: ${instagram}</p>
          <p> Produto: ${product}</p>
          <p> Curso: ${course}</p>
          <p> Modelo: ${model}</p>
          <p> Estampa de Fundo: ${background}</p>
          <p> Cor: ${color}</p>
          <p> Personagem: ${doll}</p>
          <p> Cabelo do Personagem: ${dollHair}</p>
          <p> Curso no Porta Jaleco: ${courseOnPJ}</p>
          <p> Universidade no Porta Jaleco: ${university}</p>
          <p> CEP: ${zipCode}</p>
          <p> Endereço: ${street}, ${number}</p>
          <p> Cidade: ${city}</p>
          <p> Bairro: ${neighbourhood}</p>
          <p> UF: ${state}</p>
          <p> Telefone: ${phone}</p>`,
  };

  // returning result
  return transporter.sendMail(mailOptions, (erro, info) => {
    if (erro) {
      return res.send(erro.toString());
    }
    return res.send('Sent');
  });
});

app.get('/getFrete', (req, res) => {

  let correios = new Correios();
  const cep = req.query.cep
  let args = {
    nCdServico: '04510',
    sCepOrigem: '88050536',
    sCepDestino: cep,
    nVlPeso: '1',
    nCdFormato: 3,
    nVlComprimento: 40,
    nVlAltura: 40,
    nVlLargura: 40,
    nVlDiametro: 40
  }

  correios.calcPreco(args).then((result) => {
    console.log(result)
    res.send(JSON.stringify(result))
  }).catch((error) => {
    console.log(error)
  });

});
