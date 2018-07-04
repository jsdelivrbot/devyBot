/*

Interactive part of Devy bot. 
Switch cases according to both intents from Watson and the context data of the user
Mocking data only so far. Consider loading context variables as local varables first and then access in code?

*/
//
// userID hardcoded!!!
var USERID = "AE3A5BKFY7XJCVG7FQGDFXEBUIJS3Z34YYHX743PQV27NZTP7Z3DWPPSE2LSI4YF4P5TOCOKJBWRSVSRQISLM2FW3F62BJIKN6MQY4F7QQCAGT7UXVEFMKXJEVMI5RQLD5FGPD67SDR3T2XDJLYWR6DWAJB5L5Q5E3XSEMUCCJVWLH43PROBZ34Y5W6PG6NP3RMDBBWJMWNV2KA";
var request = require('request');
var http = require('http');
var chai = require('chai'), chaiHttp = require('chai-http');
chai.use(chaiHttp);
var watson = require('watson-developer-cloud');
var conversation = new watson.ConversationV1({
    username: process.env.CONVERSATION_USERNAME,
    password: process.env.CONVERSATION_PASSWORD,
    workspace_id: process.env.WORKSPACE_ID,
    version_date: '2018-05-30',
});
const minimum_confidence = 0.5;

var intentList = [
    {
        "text": "Push code to git",
        "value": "vcPushIntent"
    },
    {
        "text": "Commit code",
        "value": "vcCommitIntent"
    },
    {
        "text": "Pull code from git",
        "value": "vcPullIntent"
    },
    {
        "text": "Get the owner of the file",
        "value": "vcGetFileOwnerIntent"
    },
    {
        "text": "Add my files",
        "value": "vcAddFilesIntent"
    },
    {
        "text": "Get the current branch",
        "value": "vcGetCurrentBranchIntent"
    },
    {
        "text": "Start working on an issue",
        "value": "ghStartIssueIntent"
    }
]


// takes the intent name and the new text example,
// uploads to Watson so new example of the intent will be added accordingly
// description is optional
function createExample(intent, example, description=null) {
    var params = {
        workspace_id: process.env.WORKSPACE_ID,
        intent: intent,
        text: example
    };
    conversation.createExample(params, function (err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log(JSON.stringify(response, null, 2));
        }
    });
}

// sends request to proxy. takes in the body part of the request
async function sendRequest(body) {
    return new Promise(function (fulfill, reject) {
        try {
            chai.request('https://skaha.cs.ubc.ca:443')
                .post('/test')
                .send(body)
                .then(function (res) {
                    // console.log(res);
                    fulfill(res);
                });
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

module.exports = function (controller) {


//     controller.hears(['some question?'], 'direct_message,direct_mention', function(bot, message) {

//         // commit intent
//         bot.createConversation(message, function(err, convo) {

//             // create a path for when a user says YES
//             convo.addMessage({
//                     text: 'How wonderful.',
//             },'yes_thread');

//             // create a path for when a user says NO
//             // mark the conversation as unsuccessful at the end
//             convo.addMessage({
//                 text: 'Cheese! It is not for everyone.',
//                 action: 'stop', // this marks the converation as unsuccessful
//             },'no_thread');

//             // create a path where neither option was matched
//             // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
//             convo.addMessage({
//                 text: 'Sorry I did not understand. Say `yes` or `no`',
//                 action: 'default',
//             },'bad_response');

//             // Create a yes/no question in the default thread...
//             convo.ask('version1', [
//                 {
//                     pattern:  bot.utterances.yes,
//                     callback: function(response, convo) {
//                         convo.gotoThread('yes_thread');
//                     },
//                 },
//                 {
//                     pattern:  bot.utterances.no,
//                     callback: function(response, convo) {
//                         convo.gotoThread('no_thread');
//                     },
//                 },
//                 {
//                     default: true,
//                     callback: function(response, convo) {
//                         convo.gotoThread('bad_response');
//                     },
//                 }
//             ]);

//             convo.activate();

//             // capture the results of the conversation and see what happened...
//             convo.on('end', function(convo) {

//                 if (convo.successful()) {
//                     // this still works to send individual replies...
//                     bot.reply(message, 'Let us eat some!');

//                     // and now deliver cheese via tcp/ip...
//                 }

//             });
//         });

//     });

    // listen to everything and send it to Watson
    controller.hears(['.*'], 'direct_message,direct_mention', function (bot, message) {
        try {
            console.log(JSON.stringify(message));
            if (message) {
                let intents = message.watsonData.intents;
                console.log(JSON.stringify(intents));

                if (!intents.length) handleConfusion(message, bot);
                else handleIntent(intents[0], bot, message);
            }
        } catch (err) {
            bot.say(message, "I'm sorry, but for technical reasons I can't respond to your message");
            console.error(err);
        }
    });
}

// takes in the intent returned by Watson
// if the confidence of the intent is lower than the set threshold, 
// it calls handleConfusion
function handleIntent(intent, bot, message) {
    let entities = message.watsonData.entities;
    if (intent.confidence < minimum_confidence) {
        handleConfusion(message, bot);
    }
    switch (intent.intent) {
        case "vcAddFilesIntent":
            addFiles(bot, message);
            break;
        case "vcCommitIntent":
            commit(bot,message);
            break;
        case "vcPullIntent":
            pull(bot,message);
            break;
        case "ghStartIssueIntent":
            let num_of_entities = entities.length;
            console.log(typeof num_of_entities);
            let startPos = entities[num_of_entities - 1].location[0];
            let endPos = entities[num_of_entities - 1].location[1];
            let issueBranch = message.text.substring(startPos, endPos);
            bot.reply(message, "I've switched you to branch " + issueBranch + " Let me know when you're finished.");
            break;
        default:
            console.log("In handleIntent()'s default switch case");
            bot.reply(message, "I don't recognize this intent.");
            break;
    }

    if (intent.intent == "ghStartIssueIntent") {
        let num_of_entities = entities.length;
        console.log(typeof num_of_entities);
        let startPos = entities[num_of_entities - 1].location[0];
        let endPos = entities[num_of_entities - 1].location[1];
        let issueBranch = message.text.substring(startPos, endPos);
        bot.reply(message, "I've switched you to branch " + issueBranch + " Let me know when you're finished.");
    }
}

function handleConfusion(message, bot) {
    bot.startConversation(message, function (err, convo) {
        convo.ask(
            {
                "text": "I don't understand what you mean.",
                "response_type": "in_channel",
                "attachments": [
                    {
                        "text": "Do you mean...",
                        "fallback": "If you could read this message, you'd be choosing something fun to do right now.",
                        // "color": "#3AA3E3",
                        "attachment_type": "default",
                        "callback_id": "handleConfusionCallback",
                        "actions": [
                            {
                                "name": "intentList",
                                "text": "Pick an intent...",
                                "type": "select",
                                "options": intentList
                            }
                        ]
                    }
                ]
            }, [
                {
                    pattern: "vcAddFilesIntent",
                    callback: function (reply, convo) {
                        // !!!
                        console.log(message.text);
                        createExample("vcAddFilesIntent", message.text, "testing!!!");
                        addFiles(bot, message);
                        convo.next();
                    }
                },
                {
                    pattern: "commit",
                    callback: function (reply, convo) {
                        // !!!
                        convo.say("request sent");
                        console.log(message.text);
                        // createExample("vcAddFilesIntent", message.text, "testing!!!");  
                        convo.next()
                    }
                }]);
        convo.say("Noted and new example for addFile intent created!");
    });
}

async function pull(bot,message) {
    var reqBody = {user: "amzn1.ask.account." + USERID, intent: "vcPullIntent", state: 0};
    try {
        var res = await sendRequest(reqBody);
        var body = JSON.parse(res.body);
        bot.startConversation(message, function (err, convo) {
        switch(body.state) {
          case "pullUncommitted":
            convo.ask({
            attachments: [
                {
                    text: body.content,
                    callback_id: 'pullUncomitted',
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
                    var reqBody = {user: "amzn1.ask.account." + USERID, intent: "vcPullIntent", state: 1};
                    sendRequest(reqBody).then((r) => {
                        convo.say(r.content);
                    convo.next();
                }).catch((err) => console.error(err));
                }
            },
            {
                pattern: "no",
                callback: function (reply, convo) {
                    convo.say(;
                    convo.next();
                }
            }]);
         convo.next();
         break;
                         }
        })
    }
    catch (err) {
        console.error("In pull:" + err);
        return;
    }
}

async function addFiles(bot, message) {
    // start with state 0, getting the list of files to be added 
    var reqBody = {user: "amzn1.ask.account." + USERID, intent: "vcAddFilesIntent", state: 0};
    try {
        var res = await sendRequest(reqBody);
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
                    var reqBody = {user: "amzn1.ask.account." + USERID, intent: "vcAddFilesIntent", state: 1};
                    sendRequest(reqBody).then((r) => {
                        convo.say('OK, I\'ve added your files.');
                    convo.next();
                }).
                    catch((err) => console.error(err)
                )
                    ;
                }
            },
            {
                pattern: "cancel",
                callback: function (reply, convo) {
                    var reqBody = {user: "amzn1.ask.account." + USERID, intent: "vcAddFilesIntent", state: 3};
                    sendRequest(reqBody).then((r) => {
                        convo.say('OK, action canceled!');
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
                                    user: "amzn1.ask.account." + USERID,
                                    intent: "vcAddFilesIntent",
                                    state: 2,
                                    fileName: fileNames[i]
                                };
                                sendRequest(reqBody).then((r) => {
                                    convo.say(fileNames[i] + ' is removed from the adding list!');
                                convo.next();
                                addFiles(bot, message);
                            }).
                                catch((err) => console.error(err)
                            )
                                ;
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

async function commit(bot, message) {
   var reqBody = {user: "amzn1.ask.account." + USERID, intent: "vcCommitIntent", state: 0};
   var res = await sendRequest(reqBody);
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
                    var reqBody = {user: "amzn1.ask.account." + USERID, intent: "vcCommitIntent", state: 1};
                    sendRequest(reqBody).then((r) => {
                        convo.say(r.content);
                    convo.next();
                }).catch((err) => console.error(err));
                }
            },
            {
                pattern: "no",
                callback: function (reply, convo) {
                    var reqBody = {user: "amzn1.ask.account." + USERID, intent: "vcCommitIntent", state: 1};
                    sendRequest(reqBody).then((r) => {
                        convo.say(r.content);
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
