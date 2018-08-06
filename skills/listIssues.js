
var functions = require("./functions");

module.exports = async function (bot, message, issueBranch) {
    var reqBody;
    reqBody = {intent: "ghListIssuesIntent"};
    try {
        var res = await functions.sendRequest(reqBody);
        var body = JSON.parse(res.body);
        bot.startConversation(message, async function (err, convo) {
        if (body.state === "error") {
            bot.reply(body.content);
            return;
        }
        if (body.number === 0) bot.reply(body.content);
        else {
          // bot.reply(message,);
            var titles = body.content;
          var actions = [];
          var callbacks = [];
            for (var t in titles) {
              var object = {
                type: "button",
                name: "issue",
                value: titles[t].index,
                text: titles[t].title};
              actions.push(object);
                // bot.reply(index + ". " + titles[t]);
            }
            for (var i in titles) {
              var object = {
                pattern: titles[i].index,
                callback: function(reply, convo) {
                  let issueNumber = reply.actions[0].value;
                  require("./main").setIssueNumber(issueNumber);
                  functions.sendRequest({intent: "setIssueNumber", issueNumber: issueNumber});
                  // convo.say(reply.text+" detected");
                  convo.next();
                }
              }
              callbacks.push(object);
                // bot.reply(index + ". " + titles[t]);
            }
            convo.ask({
              attachments: [
                {
                  title: "",
                  text: "Here's the list of the issues assigned to you. Would you like to start working on any issue?",
                  callback_id: '123',
                  attachment_type: 'default',
                  actions: actions
                }]
            },callbacks);
            convo.next();

        }
        });
    } catch (err) {
        console.error("In listIssues, caught an error:" + err);
        return;
    }
}