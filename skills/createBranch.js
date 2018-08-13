var functions = require("./functions");

module.exports = async function (bot,message, issueNumber = null) {
    var reqBody;
    console.log("IN CREATE BRANCH: issueNumber is "+ issueNumber);
    bot.startConversation(message, async function (err, convo) {
    if (issueNumber != null) {
       reqBody = {intent: "createBranch", state: 0, issueNumber: issueNumber};
    }else {
        var string = "What is the number of the issue you would like to create a branch on?";
        convo.ask(string, async function (err, reply) {
          console.log(reply.responses[string].text);
          issueNumber = reply.responses[string].text;
          convo.next();
          reqBody = {intent: "createBranch", state: 0, issueNumber: issueNumber};
        });
        convo.next();
    }
    try {
        var res = await functions.sendRequest(reqBody);
        var body = JSON.parse(res.body);
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
        }
    catch (err) {
        console.error("In checkoutBranch, caught an error:" + err);
        return;
    }
        });
}
