var functions = require("./functions");

module.exports = async function(bot, message , files = []) {

    // start with state 0, getting the list of files to be added 
    var reqBody = {user: "amzn1.ask.account." + process.env.USERID, intent: "vcAddFilesIntent", state: 0, files: files};
    try {
        var res = await functions.sendRequest(reqBody);
        var fileNames = JSON.parse(res.body);
    } catch (err) {
        console.error("In addFiles:" + err);
        return;
    }
    if (fileNames.length == 0) {
        bot.startConversation(message, function (err, convo) {
            convo.say('There were no untracked files to add.');
            convo.next();
        });
        return;
    }
    var reply_1 = 'Would you like me to add the following ' + fileNames.length.toString() + ' file(s)?';
    var reply_2 = '';
    for (let i in fileNames) {
        reply_2 = reply_2.concat('\n');
        reply_2 = reply_2.concat(fileNames[i]);
    }
    bot.startConversation(message, function (err, convo) {
        convo.ask({
            attachments: [
                {
                    title: reply_1,
                    text: reply_2,
                    // !!! figure out this callback_id
                    callback_id: '123',
                    attachment_type: 'default',
                    actions: [
                        {
                            "name": "yas",
                            "text": "Yes",
                            "value": "yes",
                            "type": "button",
                        },
                        {
                            "name": "no",
                            "text": "No",
                            "value": "no",
                            "type": "button",
                        },
                        {
                            "name": "cancel",
                            "text": "Cancel",
                            "value": "cancel",
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
                    var reqBody = {user: "amzn1.ask.account." + process.env.USERID, 
                                   intent: "vcAddFilesIntent", 
                                   state: 1,
                                   files: fileNames
                                  };
                    functions.sendRequest(reqBody).then((r) => {
                      var r_body = JSON.parse(r.body);
                      convo.say(r_body.content);
                      convo.next();
                    }).catch((err) => console.error(err));
                }
            },
            {
                pattern: "cancel",
                callback: function (reply, convo) {
                    var reqBody = {user: "amzn1.ask.account." + process.env.USERID, intent: "vcAddFilesIntent", state: 3};
                    functions.sendRequest(reqBody).then((r) => {
                        var r_body = JSON.parse(r.body);
                    convo.say(r_body.content);
                      convo.next();
                }).
                    catch((err) => console.error(err)
                )
                    ;
                }
            },
            {
                pattern: "no",
                callback: function (reply, convo) {
                    // review single files
                    var attachments = [];
                    var patterns = [];
                    for (let i in fileNames) {
                        attachments.push({
                            text: fileNames[i],
                            attachment_type: 'default',
                            callback_id: '123',
                            actions: [{
                                "name": i.toString(),
                                "text": "Remove",
                                "value": i.toString(),
                                "type": "button",
                            }]
                        });
                        patterns.push({
                            pattern: i.toString(),
                            callback: function (reply, convo) {
                                var reqBody = {
                                    user: "amzn1.ask.account." + process.env.USERID,
                                    intent: "vcAddFilesIntent",
                                    state: 2,
                                    removeIndex: i,
                                    files: fileNames
                                };
                                functions.sendRequest(reqBody).then((r) => {
                                    convo.say(fileNames[i] + ' is removed from the adding list!');
                                    convo.next();
                                    console.log(JSON.parse(r.body));
                                    module.exports(bot, message, JSON.parse(r.body));
                            }).catch((err) => console.error(err));
                            }
                        });
                    }
                    convo.say('Let\'s review the files then:');
                    let attachments_object = {};
                    attachments_object.attachments = attachments;
                    convo.ask(
                        attachments_object,
                        patterns);
                    convo.next();
                }
            }]);
    });

}
