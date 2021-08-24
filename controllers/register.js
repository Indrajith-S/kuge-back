const handleRegister = (db, bcrypt, saltRounds) => (req, res) => {
    const { email, password, name, regno } = req.body;

    if(!email || !password || !name || !regno) {
        return res.status(400).json('incorrct register form submission');
    }

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
}

module.exports = {
    handleRegister: handleRegister
}