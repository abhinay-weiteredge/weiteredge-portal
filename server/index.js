
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const loginRoutes = require('./src/routes/loginRoutes')
const timeManagementRoutes = require('./src/routes/timeManagementRoutes')
const adminRoutes = require('./src/routes/adminRoutes')


app.use(cors())
app.use(express.json())

// mongoose.connect('mongodb://127.0.0.1:27017/management').then(db =>{

//     console.log('MONGO connected');

// }).catch(error=> console.log(error));
const URI = "mongodb+srv://aishwarya:wedge123@cluster0.gnwkdjk.mongodb.net/management?retryWrites=true&w=majority"

mongoose.connect(URI)

app.use('/auth', loginRoutes)
app.use('/user', timeManagementRoutes)
app.use('/admin', adminRoutes)

app.listen(5000, () => {
    console.log('server started')
}) 
