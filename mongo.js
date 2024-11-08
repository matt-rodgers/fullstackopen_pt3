const mongoose = require('mongoose')

const displayUsage = () => {
    console.log(`Usage:`)
    console.log(`  1. Display database content:`)
    console.log(`       node mongo.js <mongodb_atlas_password>`)
    console.log(`  2. Add a person to database:`)
    console.log(`       node mongo.js <mongodb_atlas_password> <name> <number>`)
}

if ((process.argv.length != 3) && (process.argv.length != 5)) {
    displayUsage()
    process.exit(1)
}

/* Password and URL needed for all actions */
const password = process.argv[2]
const url =
  `mongodb+srv://mattrodgers31:${password}@cluster0.qsqnw.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

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
        name: process.argv[3],
        number: process.argv[4]
    })
    console.log(`Adding person ${newPerson} to database`)

    newPerson.save().then(result => {
        console.log("person saved")
        mongoose.connection.close()
    })
}

if (process.argv.length == 3) {
    displayDatabaseContent()
} else {
    addPerson()
}
