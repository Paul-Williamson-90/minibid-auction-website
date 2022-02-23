const express = require('express')
const router = express.Router()

const transporter = require('../email')
const User = require('../models/User')
const Item = require('../models/Item')
const Bid = require('../models/Bid')
const verify = require('../verifyToken')
const {post_itemValidation} = require('../validations/validation')

const jsonwebtoken = require('jsonwebtoken')

router.get('/', async(req,res) =>{
    try{
    const items = await Item.find({status:'Open'}) // needs filtering to only show items still on sale
    var display = {}
    if(items){
        for(var i=0;i < items.length; i++){
            var bids = await Bid.find({item_id:items[i]['_id']}) // all bids for iterated item
            var best = 0
            var best_bid = ''
            for(var j=0;j < bids.length; j++){    // iterate through bids and find highest one
                if (bids[j]['bid_amount']>best){
                    var best = bids[j]['bid_amount']
                    var best_bid = bids[j]['_id']
                }
            }
            display[i] = {'item':items[i],'highest_bid':best} // append item and highest bid result
        }
    }
    if(!display){
        var display = {message:'No results returned.'} // empty results
    }
    res.send({'results':display}) 
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.post('/post', verify, async(req,res)=>{

    // user input validation
    const {error} = post_itemValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }
    // code to insert item data to DB
    const item = new Item({
        name:req.body.name,
        condition:req.body.condition,
        description:req.body.description,
        post_user: req.user._id,
        end_date:req.body.end_date,
        seller_info:req.body.seller_info  
    })
    // insert initial starting bid
    const bid = new Bid({
        item_id:item['_id'],
        post_user: req.user._id,
        bid_amount:req.body.start_price
    })
    // send to DB
    try{
        const SavedItem = await item.save()
        const SavedBid = await bid.save()
        // respond with saved item to user
        res.send(SavedItem)
    }catch(err){
        res.status(400).send({message:err})
    }
    // send email confirmation
    recipient = await User.findById(req.user._id)
    let info1 = await transporter.sendMail({
        from: '"MiniBid (no-reply)" <orders@minibid.com>', // sender address
        to: recipient['email'], // list of receivers
        subject: "You posted an item for auction!", // Subject line
        text: `Hi ${recipient['username']}, thanks for posting your '${item['name']}' up for auction!`, // plain text body
        html: `<b>Hi ${recipient['username']}, thanks for posting your '${item['name']}' up for auction!</b>`, // html body
    })
})


module.exports = router