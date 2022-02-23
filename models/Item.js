const mongoose = require('mongoose')

const itemSchema = mongoose.Schema({
    name:{
        type:String,
        require:true,
        min:6,
        max:256
    },
    post_date:{
        type:Date,
        default: Date.now
    },
    end_date:{
        type:Date,
        require:true
    },
    condition:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true,
        min:6,
        max:1026
    },
    expiration:{
        type:Date
    },
    post_user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require:true
    },
    seller_info:{
        type:String,
        require:true,
        min:6,
        max:1024
    },
    status:{
        type:String,
        require:true,
        default: 'Open'
    },
    winner:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
    
})

module.exports = mongoose.model('items',itemSchema)