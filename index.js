const express = require('express')
const app = express()
const port = 3000

const config  = require('./config/key')

const mongoose = require('mongoose')

const {User} = require('./models/User')

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

mongoose.connect(config.mongoURI, {
  // useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false 4.0이후부터는 지원하지 않는 옵션
}).then(()=>console.log('MongoDB Connected!'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! 안녕')
})

app.post('/register', (req, res)=> {
  const user = new User(req.body)
  user.save((err, userInfo)=>{
    if (err) return res.json({success:false, err})
    return res.status(200).json({
      success:true
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})