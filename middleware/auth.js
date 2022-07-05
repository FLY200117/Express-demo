const { verify } = require('../util/jwt')
const { jwtSecret } = require('../config/config.default')
const { User } = require('../model')
module.exports = async(req,res,next) => {
    // 从请求头获取token数据
    let token = req.headers['authorization']
    token = token ? token.split('Bearer ')[1] : null

    if(!token) {
        console.log('token没有')
        return res.status(401).end()
    }
    // 验证token是否有效

    try {
        const decodedToken = await verify(token,jwtSecret)
        req.user = await User.findById(decodedToken.userId)
        next()
    } catch(err) {
        console.log('token验证没通过')
        return res.status(401).end()
    }
    // 无效 --> 响应401状态码
    // 有效 --> 把用户信息读取出来保存到req请求对象 继续往后执行
}