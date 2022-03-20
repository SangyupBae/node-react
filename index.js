const express = require('express')
const app = express()
const port = 3000

const config  = require('./config/key')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')

const {User} = require('./models/User')

const {auth} = require('./middleware/auth')

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())
mongoose.connect(config.mongoURI, {
  // useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false 4.0이후부터는 지원하지 않는 옵션
}).then(()=>console.log('MongoDB Connected!'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! 안녕')
})

app.post('/api/users/register', (req, res)=> {
  const user = new User(req.body)
  // console.log(req.body)
  user.save((err, userInfo)=>{
    if (err) return res.json({success:false, err})
    return res.status(200).json({
      success:true
    })
  })
})


app.post('/api/users/login',(req, res)=>{
  //요청된 이메일 찾기
  User.findOne({email: req.body.email}, (err, user)=>{
    if(!user){
      // console.log( req.body)
      // console.log(user)
      return res.json({
        loginSuccess: false,
        message: "해당 이메일 존재하지 않음"
      })
    }
    //비밀번호 같은지 확인
    user.comparePassword(req.body.password, (err, isMatch)=>{
      if(!isMatch)
      return res.json({loginSuccess: false, message: "비밀번호 틀림"})

      //비밀번호 맞으면 토큰 생성
      user.generateToken((err, user)=>{
        if(err) return res.status(400).send(err)
        res.cookie('x_auth', user.token)
        .status(200).json({loginSuccess:true, userId:user._id})

      })
    })
  })

})

//auth: 미들웨어, end 포인트에서 req를 받은 뒤 callback function 실행 전 중간에서 역할을 하는 친구
app.get('/api/users/auth', auth,(req, res)=> {
  //미들웨어를 통과하면(성공한다면) 이쪽까지 오게된다
  // console.log('미들웨어 통과')
  res.status(200).json({
    _id:req.user._id,
    isAdmin: req.user.role === 0 ? false : true, // role에 0이면 일반, 1이면 관리자
    isAuth: true,
    email:req.user.email,
    name : req.user.name,
    lastname: req.user.lastname,
    role: req.user.auth,
    image: req.user.image
  })
})

//로그아웃 라우터
app.get('/api/users/logout', auth, (req, res)=>{
  console.log(req.user._id)
  // console.log('들어옴')
  User.findOneAndUpdate({_id: req.user._id}, {token:""}, (err,user)=>{
    if(err) return res.json({success:false, err});
    return res.status(200).send({
      success:true
    })
  })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})