const Agenda = require("agenda")
const transporter = require('../email')
const Item = require("../models/Item")
const Bid = require('../models/Bid')
const User = require('../models/User')
require('dotenv/config')

const agenda = new Agenda({ db: { address: process.env.DB_CONNECTOR } })

agenda.define("update items on auction", async (job)=>{
    // assign winning bidder for items with open status and end date <= now
    const closingItems = await Item.find({status:'Open',end_date:{$lte:Date.now()}}) // grabs all items meeting criteria 
    for (var i=0;i < closingItems.length; i++){
        var item_ida = closingItems[i]['_id'] 
        var matching_bids = await Bid.find({item_id:item_ida}) // finds bids matching item being iterated
        var best = 0
        var keep = ''
        for (var j=0;j < matching_bids.length; j++){ // iterates over bids matching item id
            if(matching_bids[j]['bid_amount']>best){
                var best = matching_bids[j]['bid_amount']
                var keep = matching_bids[j]['post_user']
            }
        }
        // if the bid user is same as item user, do something
        if(String(closingItems[i]['post_user'])==String(keep)){
            // notify user of unsold item and close auction
            var recipient = await User.findById(keep)
            let info1 = await transporter.sendMail({
                from: '"MiniBid (no-reply)" <orders@minibid.com>', // sender address
                to: recipient['email'], // list of receivers
                subject: "Your item failed to sell...", // Subject line
                text: `Sorry ${recipient['username']}, your '${cloasingItems[i]['name']}' failed to sell.`, // plain text body
                html: `<b>Sorry ${recipient['username']}, your '${cloasingItems[i]['name']}' failed to sell.</b>`, // html body
            })
            //console.log("Message sent: %s", info1.messageId)
            await Item.updateOne({_id:item_ida},{status:'Closed'})
        }
        // else, assign winner and then notify users of completion
        if(String(closingItems[i]['post_user'])!=String(keep)){
            await Item.updateOne({_id:item_ida},{winner:keep,status:'Closed'})
            // notify of completion
            var item_recipient = await User.findById(keep)
            var item_seller = await User.findById(closingItems[i]['post_user'])
            let info2 = await transporter.sendMail({
                from: '"MiniBid (no-reply)" <orders@minibid.com>', // sender address
                to: item_recipient['email'], // list of receivers
                subject: `Congratulations ${item_recipient['username']}! You won an auction!`, // Subject line
                text: "The details will eventually go here.", // plain text body
                html: "<b>The details will eventually go here.</b>", // html body
            })
            //console.log("Message sent: %s", info2.messageId)
            let info3 = await transporter.sendMail({
                from: '"MiniBid (no-reply)" <orders@minibid.com>', // sender address
                to: item_seller['email'], // list of receivers
                subject: `Congratulations ${item_seller['username']}! Your item sold!`, // Subject line
                text: "The details will eventually go here.", // plain text body
                html: "<b>The details will eventually go here.</b>", // html body
            })
            //console.log("Message sent: %s", info3.messageId)
        }
    }
});
(async function () {
    await agenda.start()
    await agenda.every("1 minutes", "update items on auction")  
  })()

module.exports=agenda