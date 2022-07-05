const jwt = require('jsonwebtoken')
const { promisify } = require('util')

exports.sign = promisify(jwt.sign)

exports.verify = promisify(jwt.verify)

// 不做验证解析token
exports.decode = promisify(jwt.decode)

// 生成 jwt
// const token = jwt.sign({
//     foo: 'bar'
// },'lyf')


// sign第三个参数接受一个callback,如果传入，则sign会变成一个异步函数
// sign默认为同步
// const token = jwt.sign({
//     foo: 'bar'
// },'lyf',(err,token) => {
//     if(err){
//         return console.log('生成token失败')
//     }
//     console.log(token)
// })

// console.log(token)

// // 验证jwt
// const ret = jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE2NTY5OTgwNTZ9.yKrVdMbNJDxfKuDtkpo5dRBPvfCr0xZNA4hEDXUGEH4','lyf1',
//     (err,ret) => {
//         if(err){
//             return console.log('验证失败')
//         }
//         console.log(ret)
//     }
// )

// console.log(ret)