var functions = require("./functions");

module.exports = async function (bot,message, issueBranch) {
    var reqBody;
    reqBody = {intent: "ghListIssuesIntent"};
    try {
        var res = await functions.sendRequest(reqBody);
        var body = JSON.parse(res.body);
        bot.startConversation(message, async function (err, convo) {
           if (body.state==="error") {
             convo.say(body.content);
             return;
           } 
           if (body.number === 0) convo.say(body.content);
           else {
             var titles = body.content;
             convo.say("Here's the list of the issues assigned to you:");
             var index = 1;
             for (var t in titles) {
               convo.say(index +". " + titles[t]);
               index++;
             }
           }
          convo.next();
        });
    } catch (err) {
        console.error("In listIssues, caught an error:" + err);
        return;
    }
}
