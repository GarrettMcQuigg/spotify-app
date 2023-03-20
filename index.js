require('dotenv').config();
const express = require('express');
const querystring = require('querystring');
const axios = require('axios');
const db = require('./db');
const cors = require('cors');
const path = require('path');
const keys = require('./keys');
const bodyParser = require('body-parser');

const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:2222/callback';
const FRONTEND_URI = process.env.FRONTEND_URI;
const PORT = process.env.PORT || 2222;

app.use(express.static(path.resolve(__dirname, './client/build')));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Successfully running.');
});

/**
 * Generates a random string containing numbers and letters
 * @param {number} length the length of the string
 * @return {string} the generated string
 */

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
};

const stateKey = 'spotify_auth_state';

app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = 'user-read-private user-read-email user-top-read';

  res.redirect(
    `https://accounts.spotify.com/authorize?${querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state,
    })}`
  );
});

app.post('/support', async (req, res) => {
  try {
    const { subject, message } = req.body;

    const results = await db.query(
      `
        INSERT INTO Tickets
        (subject,
         message)
        VALUES ($1, $2)
        `,
      [subject, message]
    );
    return res.json(results.rows[0]);
  } catch (err) {
    console.error(err);
  }
});

app.get('/callback', (req, res) => {
  const code = req.query.code || null;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        const { access_token, refresh_token } = response.data;

        const queryParams = querystring.stringify({
          access_token,
          refresh_token,
        });

        res.redirect(`${FRONTEND_URI}/?${queryParams}`);
      } else {
        res.redirect(`/?${querystring.stringify({ error: 'invalid_token' })}`);
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get('/refresh_token', (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Express app listening at http://localhost:${PORT}`);
});
