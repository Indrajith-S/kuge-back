const express = require('express');//import express from './express';
const bodyParser = require('body-parser');//to parse objects passed in the request body
const bcrypt = require('bcrypt'); //password hashing library
const knex = require('knex')
const saltRounds = 10;
const cors= require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

/*methods-
GET - when youre requesting a page from the server
POST - when you want to request changes from the server
PUT 
DELETE
*/

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'postgres',
        database: 'kuge-gemu'
    }
})



app.get('/', (req, res) => { //"/" represents root directory
    res.json(database.users); 
})

app.post('/signin', (req, res) => { // signin represents the signin dir in root
    db.select('email', 'hash').from('login') //for authentication we access login table
    .where('email', '=', req.body.email)
    .then(data => {//sql returns an array of output (data -> table of output/result)
        //compare with password
        if(bcrypt.compareSync(req.body.password, data[0].hash)){ //returning a boolean value if password and hash match
            return db.select('*').from('users') //for authorisation we access user table
            .where('email', '=', req.body.email) //or data[0].email
            .then(user => {
                res.json(user[0]);
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req,res)=>{
    const { email, password, name, regno } = req.body;

    const hash = bcrypt.hashSync(password, saltRounds);

    //generate random clan for the registered user
    const clans = ['Kenjutsu', 'Bojutsu', 'Kyujutsu', 'Sojutsu'];
    const clan = clans[Math.floor(Math.random()*clans.length)];

    //adding them to the database
    //transaction - make sure that if one is executed only then the other will get executed for a database
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                clan: clan,
                regno: regno,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json(err))//err
})

app.listen(3000, ()=> {
    console.log('app is running on port 3000'); // localhost:3000
})