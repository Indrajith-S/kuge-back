const handleSignin = (req, res, db, bcrypt) => { // signin represents the signin dir in root

    const {email, password } = req.body;
    if(!email || !password ) {
        return res.status(400).json('incorrct login form submission');
    }

    db.select('email', 'hash').from('login') //for authentication we access login table
    .where('email', '=', email)
    .then(data => {//sql returns an array of output (data -> table of output/result)
        //compare with password
        if(bcrypt.compareSync(password, data[0].hash)){ //returning a boolean value if password and hash match
            return db.select('*').from('users') //for authorisation we access user table
            .where('email', '=', email) //or data[0].email
            .then(user => {
                res.json(user[0]);
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
    handleSignin: handleSignin
}