const { User } = require('../model')
const jwt = require('../util/jwt')
const { jwtSecret } = require('../config/config.default')

// 用户登录
exports.login = async (req,res,next) => {
    try {
        // 1.数据验证
        // 2.生成token
        const user = req.user.toJSON()
        const token = await jwt.sign({
            userId: user._id
        },jwtSecret,{
            // expiresIn: 30 // expiresIn是限制token存在时间
        })
        // 3.发送成功响应（包含token）
        delete user.password
        res.status(200).json({
            ...user,
            token
        })
    } catch(err){
        next(err)
    }
}

// 用户注册
exports.register = async (req,res,next) => {
    try {
        // 1.获取请求体数据
        console.log(req.body)
        // 2.数据验证
        // 2.1 基本数据验证
        // 2.2 业务数据验证

        
        // 3.验证通过
        const user = new User(req.body.user)

        // 保存到数据库
        await user.save()

        // user = user.toJSON()

        // delete user.password

        // 4.发送成功响应
        res.status(201).json({
            user
        })
    } catch(err){
        next(err)
    }
}

// 获取当前登录用户
exports.getCurrentUser = async (req,res,next) => {
    try {
        res.status(200).json({
            user: req.user
        })
    } catch(err){
        next(err)
    }
}

// 更新当前登录用户
exports.updateCurrentUser = async (req,res,next) => {
    try {
        res.send('update user')
    } catch(err){
        next(err)
    }
}