const { Article,User } = require('../model')

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


exports.GetArticle = async (req,res,next) => {
    try{
        const article = await Article.findById(req.params.articleId).
        populate('author')
        if(!article) {
            return res.status(404).end()
        }
        res.status(200).json({
            article
        })
    } catch(err) {
        next(err)
    }
}

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

exports.UpdateArticle = async (req,res,next) => {
    try{
        const article = req.article
        const bodyArticle = req.body.article
        article.title = bodyArticle.title || article.title
        article.description = bodyArticle.description || article.description
        article.body = bodyArticle.body || article.body
        await article.save()
        res.status(201).json({
            article
        })
    } catch(err) {
        next(err)
    }
}

exports.DeleteArticle = async (req,res,next) => {
    try{
        const article = req.article
        await article.remove()
        res.status(204).end()
    } catch(err) {
        next(err)
    }
}