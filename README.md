# Express-demo
主要是学习express框架的小demo，基本的登录token注册和增删查改都有实现

### 项目

#### 创建项目

```
mkdir realworld-api-express

cdd realworld-api-express

npm init

npm i express
```





#### 配置中间件

- 解析请求体
  - express.json()
  - express.urlencoded()
- 日志输出（第三方）
  - morgan()
- 为客户端提供跨域资源请求（第三方）
  - cors()
- 信息验证（第三方）
  - express-validator()





#### router路由设置

- 统一创建router文件夹对路由进行管理
- 在app.js文件中挂载路由并设置路由前缀api

```js
// 挂载路由
app.use('/api',router)
```

- 路由文件中只设置路由映射，不设置具体的业务逻辑
- 统一将业务逻辑封装到controller下进行管理



#### middleware错误处理中间件

- 此处的错误处理中间件通过挂载的形式独立出去到middlerware文件中
- 错误处理使用express中提供的uitl来帮助我们在开发过程中显示完整的错误信息

```js
const util = require('util')
module.exports = () => {
    return (err,req,res,next) => {
        res.status(500).json({
            error: util.format(err)
        })
    }
}


// app.js中挂载统一处理服务端错误中间件
app.use(errorHandler())
```



#### middleware校验token和验证id

- 一般校验token和验证id都通常做成中间件放在请求和业务逻辑层中间
- token使用JWT中提供的方法来生成，而在生成token的过程中jwtSecret可以使用[uuid](https://www.uuidgenerator.net/)来帮助生成Secret
- 在使用token验证的过程中使用Bearer标签头

```js
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
```

- 验证方法都是通过`express-validator`提供的validate来帮助验证
- 由于文章接口中有多个接口都需要使用id验证，所以使用`express-validator`提供的`buildCheckFunction`来帮助我们将公共代码进行提取
- id验证方法由`mongoose`提供的`isValidObjectId`方法来验证id

```js
const { validationResult,buildCheckFunction } = require('express-validator')
const { isValidObjectId } = require('mongoose')

// parallel processing
exports = module.exports = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

exports.isValidObjectId = (location,fields) => {
  return buildCheckFunction(location)(fields).custom(async value => 
  {
    if(!isValidObjectId(value)){
      return Promise.reject('ID不是一个有效的ObjectID')
    }
  })
}
```





#### Model连接Mongo数据库

- 在当前项目中创建model文件来对数据库进行统一管理
- 此处使用mongoose第三方插件来完成连接
- 连接完数据库之后需要对数据库进行操作，此时需要一个模型对象来完成数据库中表的设置

```js
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
    User: mongoose.model('User',require('./user'))
}
```

- 将模型独立出去一个文件进行配置

```js
const mongoose = require('mongoose')
const baseModel = require('./base-model')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: null
    },
    image: {
        type: String,
        default: null
    },
    ...baseModel
})

module.exports = userSchema
```

- 在数据库配置中可以通过...扩展运算符来完成公共代码的混入

```js
module.exports = {
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}
```



#### Controller业务逻辑	

- 创建的Controller文件用来管理项目中的业务逻辑，对数据的过滤以及响应的设置

- 用户注册功能

  - 1.获取请求体数据

    - 请求体的数据通过`req.body`来获取

  - 2.数据验证

    - 2.1 基本数据验证
    - 2.2 业务数据验证
    - 数据验证方面，项目使用了[express-validator](https://express-validator.github.io/)中间件来对数据进行统一处理
    - 验证规则使用了`body`中的方法来数据进行处理，注意，如果处理的过程中需要数据库中的数据，记得导入Model中的模型，此处导入的是User表

    ```js
    body('user.email')
        .notEmpty().withMessage('邮箱不能为空')
        .isEmail().withMessage('邮箱格式不正确')
        .bail()
        .custom(async email => {
            const user = await User.findOne({ email })
            if(user) {
                return Promise.reject('邮箱已存在')
            }
        })
    ```

    - 使用`validationResult`来对错误信息进行统一响应，该方法会将错误信息放入一个数组中，等响应完成后将数组中所有的错误信息进行统一响应
    - 数据验证可以单独出一个文件夹`validator`中进行管理，在使用的过程中可以在`router`路由中业务方法的前面以中间件的形式使用

    ```
    // 用户注册
    router.post('/users',userValidator.register,userCtrl.register)
    ```

  - 3.验证通过，数据库存储

    - 当前需要获取model中的数据库对象，然后将请求体中的数据存储到数据库中
    - 注意，此处的存储功能一定要用await设置，需要等待请求接受到才进行存储

    ```js
    // 3.验证通过
    const user = new User(req.body.user)
    // 保存到数据库
    await user.save()
    ```

  - 4.发送成功响应

    - 成功响应对应的状态码为201，一般返回json数据格式

    ```js
    // 4.发送成功响应
    res.status(201).json({
       user
    })
    ```

- 文章功能

  - Get：获取文章可以通过参数来对返回的内容进行过滤，同时也可以自己定义过滤规则来对数据进行处理

    ```js
    exports.GetArticles = async (req,res,next) => {
        try{
            const { 
                limit = 20,
                offset = 0,
                tag,
                author
            } = req.query 
    
            const filter = {}
            // 创建过滤器，如果请求参数中有tag，则会根据tag的值取tagList中查找包含tag值的数据
            if(tag) {
                filter.tagList = tag
            }
    
            if(author) {
                const user = await User.findOne({ 
                    username: author 
                })
                filter.author = user ? user._id : null
            }
            
            const articlesCount = await Article.countDocuments()
            // const articlesCount = articles.length
            const articles = await Article.find(filter)
            .skip(Number.parseInt(offset)) //跳过多少条offset
            .limit(Number.parseInt(limit)) //取多少条limit
            .sort({
                // -1 倒序 1 正序
                createdAt: -1
            })
            
            res.status(200).json({
                articles,
                articlesCount
            })
        } catch(err) {
            next(err)
        }
    }
    ```

  - Post：增加数据，在增加ObjectId数据的时候需要使用`mongoose`提供的`populate`方法来完成ObjectId数据类型的添加

    ```js
    exports.CreateArticle = async (req,res,next) => {
        try{
            const article = new Article(req.body.article)
            article.author = req.user._id
            article.populate('author')
            await article.save()
            res.status(201).json({
                article
            })
        } catch(err) {
            next(err)
        }
    }
    ```

  - delete：...  update：...

  - 在Controller层中注意，有些逻辑或者验证需要获取数据例如用户id的时候，可以在中间件验证中获取数据保存到req中，这样在Controller层中就不用单独再去获取数据
