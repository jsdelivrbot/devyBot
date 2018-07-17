var functions = require("./functions");

module.exports = async function commit(bot, message) {
   var reqBody = {user: "amzn1.ask.account." + process.env.USERID, intent: "vcCommitIntent", state: 0};
   var res = await functions.sendRequest(reqBody);
   res = JSON.parse(res.body);
   var state = res.state;
   bot.startConversation(message, function (err, convo) {
     switch(state) {
       case "CommitUntracked":
       case "Untracked":
            convo.ask({
            attachments: [
                {
                    // title: reply_1,
                    text: res.content,
                    // !!! figure out this callback_id
                    callback_id: 'CommitUntracked',
                    attachment_type: 'default',
                    actions: [
                        {
                            "name": "yes",
                            "text": "Yes",
                            "value": "yes",
                            "type": "button",
                        },
                        {
                            "name": "no",
                            "text": "No",
                            "value": "no",
                            "type": "button",
                        }
                    ]
                }
            ]
        }, [
            {
                pattern: "yes",
                callback: function (reply, convo) {
                    // !!!
                    var reqBody = {user: "amzn1.ask.account." + process.env.USERID, intent: "vcCommitIntent", state: 1};
                    functions.sendRequest(reqBody).then((r) => {
                        var r_body = JSON.parse(r.body);
                    convo.say(r_body.content);
                      convo.next();
                }).catch((err) => console.error(err));
                }
            },
            {
                pattern: "no",
                callback: function (reply, convo) {
                    var reqBody = {user: "amzn1.ask.account." + process.env.USERID, intent: "vcCommitIntent", state: 2};
                    functions.sendRequest(reqBody).then((r) => {
                        var r_body = JSON.parse(r.body);
                    convo.say(r_body.content);
                      convo.next();});
                }
            }]);
         convo.next();
         break;
         
        case "Nothing": 
           convo.say(res.content);
           convo.next();
           break;
         
       case "error":
           convo.say("There's been an error committing your file.");
           console.error(res.content);
           convo.next();
           break;
         
       case "success":
           convo.say(res.content);
           convo.next();
           break;
         
       default: 
         console.log("AT COMMIT DEFAULT SWITCH CASE");
         break;
                 }});
    // if (res) convo.say("Committed successfully!");
   return;
}