const express = require('express')
const router = express.Router()

const User = require('../models/User')
const {registerValidation, loginValidation} = require('../validations/validation')

const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')

router.post('/register', async(req,res)=>{

    // user input validation
    const {error} = registerValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }

    // check if user exists validation - email
    const userExistsEmail = await User.findOne({email:req.body.email})
    if(userExistsEmail){
        return res.status(400).send({message:'There is already an account belonging to this email address'})
    }

    // check if user exists validation - user
    const userExistsUser = await User.findOne({username:req.body.username})
    if(userExistsUser){
        return res.status(400).send({message:'Username already exists'})
    }

    // hashed password
    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password,salt)

    // code to insert data
    const user = new User({
        username:req.body.username,
        email:req.body.email,
        password:hashedPassword
    })

    try{
        const SavedUser = await user.save()
        res.send(SavedUser)
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.post('/login', async(req,res)=>{

    // user input validation
    const {error} = loginValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }

    // check user exists
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(400).send({message:'Login credentials not recognised'})
    }

    // check user password
    const passwordValidation = await bcryptjs.compare(req.body.password,user.password)
    if(!passwordValidation){
        return res.status(400).send({message:'Login credentials not recognised'})
    }
    
    // generate auth-token
    const token = jsonwebtoken.sign({_id:user._id}, process.env.TOKEN_SECRET,{
        expiresIn: "2h"
      })
    res.header('auth-token', token).send({'auth_token':token})
    //res.header('username',user.username).send({'username':user.username})
})

module.exports=router