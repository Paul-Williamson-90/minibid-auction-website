const joi = require('joi')

const registerValidation = (data) =>{
    const schemaValidation = joi.object({
        username:joi.string().alphanum().required().min(3).max(256),
        email:joi.string().lowercase().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1024)
    })
    return schemaValidation.validate(data)
}

const loginValidation = (data) =>{
    const schemaValidation = joi.object({
        email:joi.string().lowercase().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1024)
    })
    return schemaValidation.validate(data)
}

const post_itemValidation = (data) =>{
    const schemaValidation = joi.object({
        name:joi.string().required().min(6).max(256),
        condition:joi.required().allow('Used','New').only(),
        description:joi.string().required().min(6).max(1024),
        end_date:joi.date().greater('now').required(),
        start_price:joi.number().min(0).required(),
        seller_info:joi.string().min(6).max(1024),
        status:joi.string().allow('Open','Closed').only()
    })
    return schemaValidation.validate(data)
}

const enter_bidValidation = (data) =>{
    const schemaValidation = joi.object({
        bid_amount:joi.number().min(0).required(),
        item_id:joi.string().required()
    })
    return schemaValidation.validate(data)
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
module.exports.post_itemValidation = post_itemValidation
module.exports.enter_bidValidation = enter_bidValidation