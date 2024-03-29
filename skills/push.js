var functions = require("./functions");

module.exports = async function push(bot,message) {
    var reqBody = {intent: "vcPushIntent", state: 0};
    try {
        var res = await functions.sendRequest(reqBody);
        var body = JSON.parse(res.body);
        bot.startConversation(message, function (err, convo) {
        switch(body.state) {
          case "pushUncommitted":
            convo.ask({
            attachments: [
                {
                    text: body.content,
                    callback_id: 'pushUncomitted',
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
                    var reqBody = {intent: "vcPushIntent", state: 1};
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
                    var reqBody = {intent: "vcPushIntent", state: 2};
                    functions.sendRequest(reqBody).then((r) => {
                    var r_body = JSON.parse(r.body);
                    convo.say(r_body.content);
                      convo.next();
                    });
                }
            }]);
         convo.next();
         break;
            
          case "success":
          case "fail":
          case "canceled": 
            convo.say(body.content);
            convo.next();
            break;
            
          case "error" :
            convo.say("There has been an error pulling your files.");
            console.error(body.content);
            break;
            
          default: 
            console.error("in push default case");
            break;
                         }
        })
    }
    catch (err) {
        console.error("In push, caught an error:" + err);
        return;
    }
}