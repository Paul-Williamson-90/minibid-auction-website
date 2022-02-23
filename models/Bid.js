const mongoose = require('mongoose')

const bidSchema = mongoose.Schema({
    item_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'items',
        require:true
    },
    post_date:{
        type:Date,
        default: Date.now
    },
    post_user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require:true
    },
    bid_amount:{
        type:Number,
        require:true,
        min:0
    }
})

module.exports = mongoose.model('bids',bidSchema)