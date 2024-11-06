const express = require('express')
const morgan = require('morgan')
const app = express()

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

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})

const personExists = (name) => {
  return persons.some(p => p.name === name)
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({error: "name missing"})
  } else if (!body.number) {
    return response.status(400).json({error: "number missing"})
  } else if (personExists(body.name)) {
    return response.status(400).json({error: "name already exists"})
  }

  const person = {
    name: body.name.toString(),
    number: body.number.toString(),
    id: Math.floor(Math.random() * 4294967295) // max uint32
  }

  persons = persons.concat(person)
  response.json(person)
})

app.get('/info', (request, response) => {
    const currentTimestamp = new Date().toString()
    const infoPage = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Phonebook info</title>
  </head>
  <body>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${currentTimestamp}</p>
  </body>
</html>
`
    response.send(infoPage)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})
