const mongoose = require('mongoose');
const { dbUrl } = require('../config/config.default')

// 连接MongoDB 数据库
mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 建立数据库连接
const db = mongoose.connection

// 当连接失败的时候
db.on('error', err => {
    console.log('连接失败')
})

// 当连接成功的时候
db.on('open', () => {
    console.log('MongoDB 数据库连接成功')
})

// 组织导出模型类
module.exports = {
    User: mongoose.model('User',require('./user')),
    Article: mongoose.model('Article',require('./article'))
}