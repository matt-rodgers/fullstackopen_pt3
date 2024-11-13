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
morgan.token('body' ,(req, _res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return ' '
  }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (_request, response, next) => {
  Person.find({}).then(res => {
    response.json(res)
  })
    .catch(e => next(e))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id).then(res => {
    if (res) {
      response.json(res)
    } else {
      response.status(404).end()
    }
  })
    .catch(e => next(e))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id).then(_res => {
    console.log(`Deleted ${id}`)
    response.status(204).end()
  })
    .catch(e => next(e))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  } else if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  }

  const newPerson = new Person({
    name: body.name.toString(),
    number: body.number.toString(),
  })

  console.log(`Adding person ${newPerson} to database`)

  newPerson.save().then(_res => {
    console.log('person saved')
    response.json(newPerson)
  })
    .catch(e => next(e))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  } else if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  }

  const newPerson = {
    name: body.name.toString(),
    number: body.number.toString(),
  }

  console.log(`Updating ${newPerson.name}`)

  Person.findByIdAndUpdate(
    request.params.id,
    newPerson,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(e => next(e))
})

app.get('/info', (request, response, next) => {
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
    .catch(e => next(e))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted ID' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

// Must be last loaded middleware
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
