
var functions = require("./functions");

module.exports = async function (bot, message, issueBranch) {
    var reqBody;
    reqBody = {intent: "ghListIssuesIntent"};
    try {
        var res = await functions.sendRequest(reqBody);
        var body = JSON.parse(res.body);
        // bot.startConversation(message, async function (err, convo) {
        if (body.state === "error") {
            bot.reply(body.content);
            return;
        }
        if (body.number === 0) bot.reply(body.content);
        else {
          bot.reply(message,"Here's the list of the issues assigned to you. Would you like to start working on any issue?");
            var titles = body.content;
          var actions = [];
            for (var t in titles) {
              var object = {
                type: "button",
                name: "issue",
                text: titles[t]}
              actions.push(object);
                // bot.reply(index + ". " + titles[t]);
            }
            bot.reply(message,{
              attachments: [
                {
                  fallback: "listIssues",
                  actions: actions
                }]
            });
            
        }
        // convo.next();
        // });
    } catch (err) {
        console.error("In listIssues, caught an error:" + err);
        return;
    }
}