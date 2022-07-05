const { Router } = require('express')
const express = require('express')
const router = express.Router()

router.get('/tags',async(req,res,next) => {
    try{
        res.send('get /tags')
    } catch(err) {
        next(err)
    }
})

module.exports = router