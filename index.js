/* Load .env file first before any other imports */
require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

/* Logging using morgan */
morgan.token('body' ,(req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return " "
  }
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(res => {
    response.json(res)
  })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findById(id).then(res => {
    if (res) {
      response.json(res)
    } else {
      response.status(404).end()
    }
  })
  .catch((e) => {
    console.log(`Error looking up ${id}: ${e}`)
    response.status(400).end() // Placeholder, 400 might not be right in all cases
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findByIdAndDelete(id).then(res => {
    console.log(`Deleted ${id}`)
    response.status(204).end()
  })
  .catch((e) => {
    console.log(`Error looking up ${id}: ${e}`)
    response.status(400).end() // Placeholder, 400 might not be right in all cases
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({error: "name missing"})
  } else if (!body.number) {
    return response.status(400).json({error: "number missing"})
  }

  const newPerson = new Person({
    name: body.name.toString(),
    number: body.number.toString(),
  })
  console.log(`Adding person ${newPerson} to database`)

  newPerson.save().then(res => {
    console.log("person saved")
    response.json(newPerson)
  })
})

app.get('/info', (request, response) => {
  const currentTimestamp = new Date().toString()
  Person.countDocuments({}).then(count => {
    const infoPage = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Phonebook info</title>
    </head>
    <body>
    <p>Phonebook has info for ${count} people</p>
    <p>${currentTimestamp}</p>
    </body>
    </html>
    `
    response.send(infoPage)
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
