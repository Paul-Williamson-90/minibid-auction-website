// dependencies
const express = require('express')
const app = express()

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv/config')

app.use(bodyParser.json())

// routes / middleware
const itemsRoute = require('./routes/items')
const authRoute = require('./routes/auth')
const bidsRoute = require('./routes/bids')

// automations
const schedulerRoute = require('./controllers/scheduler')

// routes linked to models
app.use('/api/item',itemsRoute)
app.use('/api/bid',bidsRoute)
app.use('/api/user',authRoute)

// connections
mongoose.connect(process.env.DB_CONNECTOR, ()=>{
     console.log('DB is connected')
})

app.listen(3000, ()=>{
    console.log('Server running.')
})