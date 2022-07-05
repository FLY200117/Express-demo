const express = require('express')

const router = express.Router()

// 获取用户资料
router.get('/:username',async(req,res,next) => {
    try{
        res.get('get /profiles/:username')
    } catch(err) {
        next(err)
    }
})

// 关注用户
router.post('/:username/follow',async(req,res,next) => {
    try{
        res.get('post /profiles/:username/follow')
    } catch(err) {
        next(err)
    }
})

// 取消关注用户
router.delete('/:username/follow',async(req,res,next) => {
    try{
        res.get('delete /profiles/:username/follow')
    } catch(err) {
        next(err)
    }
})


module.exports = router