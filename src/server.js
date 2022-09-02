const express = require('express')
const app = express()
const port = 3002

const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'build')))

const eventController = require('./eventController')

app.get('/api/events', eventController.getData)
app.post('/api/events', eventController.postData)
app.put('/api/events/:event_id', eventController.putData)
app.delete('/api/events/:event_id', eventController.deleteData)

app.listen(process.env.PORT || port, () => console.log(`mock apoi listening on port ${port}`)) 