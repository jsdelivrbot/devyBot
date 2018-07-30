var functions = require("./functions");

module.exports = async function (bot,message, branchName) {
    var reqBody;
    console.log("IN CHECKOUT BRANCH: branchName is "+ branchName);
    reqBody = {intent: "ghCheckoutBranch", state: 0, branchName: branchName};
    try {
        var res = await functions.sendRequest(reqBody);
        var body = JSON.parse(res.body);
        bot.startConversation(message, async function (err, convo) {
        switch(body.state) {
    
          case "success":
            convo.say(body.content);
            convo.next();
            break;
            
          case "error" :
            convo.say(body.content);
            convo.next();
            break;
            
          default: 
            console.error("in checkoutBranch default case");
            break;
                         }
        })
    }
    catch (err) {
        console.error("In checkoutBranch, caught an error:" + err);
        return;
    }
}
