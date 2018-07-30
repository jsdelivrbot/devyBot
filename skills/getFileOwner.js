var functions = require("./functions");

module.exports = async function (bot,message, issueBranch) {
    var reqBody;
    reqBody = {intent: "vcGetFileOwnerIntent"};
    try {
        var res = await functions.sendRequest(reqBody);
        var body = JSON.parse(res.body);
        bot.startConversation(message, async function (err, convo) {
           convo.say(body.content);
          convo.next();
        });
    } catch (err) {
        console.error("In listIssues, caught an error:" + err);
        return;
    }
}
