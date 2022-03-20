const { User } = require("../models/User");

let auth = (req, res, next)=>{
    // console.log('auth.js')
    // 인증 처리 구현
    // 클라이언트 쿠키에서 토큰 가져오기
    let token = req.cookies.x_auth;

    //토큰을 복호화한 후 유저 찾기
    User.findByToken(token, (err, user)=>{
        if(err) throw err
        if(!user) return res.json({isAuth:false, error:true})

        req.token = token; //req에서 토큰과 유저정보를 사용할 수 있도록 하기 위해서 담아준다
        req.user=user;

        next();
    })

    //유저가있으면 인증 성공
    //유저가 없으면 인증실패
}

module.exports = {auth};