const express = require('express')
const router = express.Router()

const User = require('../models/User')
const Bid = require('../models/Bid')
const Item = require('../models/Item')
const verify = require('../verifyToken')
const {enter_bidValidation} = require('../validations/validation')

router.post('/post', verify, async(req,res)=>{
    // validate user input
    const {error} = enter_bidValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }
    // check item Id validity
    var ObjectId = require('mongoose').Types.ObjectId;
    if(!ObjectId.isValid(req.body.item_id)){
        return res.status(400).send({message:'Invalid item Id entry.'})
    }
    // check item exists
    const item = await Item.findById(req.body.item_id)
    if(!item){
        return res.status(400).send({message:'Item Id not recognised.'})
    }
    // stop user bidding on own item
    if(item['post_user']==req.user._id){
        return res.status(400).send({message:'You cannot bid on your own item.'})
    }
    // check item still on sale
    var date = Date.now()
    if(!date>item['end_date']){
        return res.status(400).send({message:'Item no longer on sale.'})
    }
    // check if bid amount more than current bid
    const attempt_bid = req.body.bid_amount 
    const current_bid = (await Bid.find({_item_id:req.body.item_id}))
    var best = 0
    for (var i=0;i < current_bid.length; i++){
        if(current_bid[i]['bid_amount']>best){
            var best = current_bid[i]['bid_amount']
        }
    }
    if(attempt_bid<=best){
        return res.status(400).send({message:'Attempted bid less than or equal to current bid amount.'})
    }

    // code to insert bid data to DB
    const bid = new Bid({
        item_id:req.body.item_id,
        post_user: req.user._id,
        bid_amount:req.body.bid_amount
    })

    try{
        const SavedBid = await bid.save()
        res.send(SavedBid)
    }catch(err){
        res.status(400).send({message:err})
    }
})

module.exports = router