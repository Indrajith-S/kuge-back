const express = require('express');//import express from './express';
const bodyParser = require('body-parser');//to parse objects passed in the request body
const bcrypt = require('bcrypt'); //password hashing library
const knex = require('knex')
const saltRounds = 10;
const cors= require('cors');

//importing controllers
const register = require('./controllers/register');
const signin = require('./controllers/signin');


const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'postgres',
        database: 'kuge-gemu'
    }
})


const app = express();
app.use(bodyParser.json());
app.use(cors());

/*methods-
GET - when youre requesting a page from the server
POST - when you want to request changes from the server
PUT 
DELETE
*/


app.get('/', (req, res) => { //"/" represents root directory
    res.json('server is working'); 
})

app.post('/signin', (req, res) => {signin.handleSignin(req, res, db, bcrypt)}); //dependency injection

app.post('/register', register.handleRegister(db, bcrypt, saltRounds));//dependency injection

app.listen(3000, ()=> {
    console.log('app is running on port 3000'); // localhost:3000
})