/* Load .env file first before any other imports */
require('dotenv').config()

const Person = require('./models/person')
const mongoose = require('mongoose')

const displayUsage = () => {
    console.log(`Usage:`)
    console.log(`  1. Display database content:`)
    console.log(`       node mongo.js`)
    console.log(`  2. Add a person to database:`)
    console.log(`       node mongo.js <name> <number>`)
}

if ((process.argv.length != 2) && (process.argv.length != 4)) {
    displayUsage()
    process.exit(1)
}

const displayDatabaseContent = () => {
    console.log("Phonebook:")
    Person.find({}).then(res => {
        res.forEach(p => {
            console.log(`${p.name} ${p.number}`)
        })
        mongoose.connection.close()
    })
}

const addPerson = () => {
    const newPerson = new Person({
        name: process.argv[2],
        number: process.argv[3]
    })
    console.log(`Adding person ${newPerson} to database`)

    newPerson.save().then(result => {
        console.log("person saved")
        mongoose.connection.close()
    })
}

if (process.argv.length == 2) {
    displayDatabaseContent()
} else {
    addPerson()
}
