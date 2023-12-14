const bcrypt = require('bcrypt')

const users = [
    {
      email: 'andilemhlanga16@gmail.com',
      password: bcrypt.hashSync('cognitivedev', 10),
      role: 'admin'  
    },
    {
        email: 'andile.koddy@gmail.com',
        password: bcrypt.hashSync('koddydev', 10)
    }
]

module.exports = users;