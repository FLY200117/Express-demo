const express = require('express')
const ArticleCtrl = require('../controller/article')
const auth = require('../middleware/auth')
const articleValidatop = require('../validator/article')

const router = express.Router()

router.get('/',ArticleCtrl.GetArticles)

router.get('/:articleId',articleValidatop.getArticle,ArticleCtrl.GetArticle)

router.post('/',auth,articleValidatop.createArticle,ArticleCtrl.CreateArticle)

router.put('/:articleId',auth,articleValidatop.updateArticle,ArticleCtrl.UpdateArticle)

router.delete('/:articleId',auth,articleValidatop.deleteArticle,ArticleCtrl.DeleteArticle)

module.exports = router