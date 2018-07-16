/*

Interactive part of Devy bot. 
Switch cases according to both intents from Watson and the context data of the user
Mocking data only so far. Consider loading context variables as local varables first and then access in code?

*/
//


var addFiles = require("./addFiles");
var commit = require("./commit");
var pull = require("./pull");
var push = require("./push");
var functions = require("./functions");
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
    },
    {
        "text": "Create new workflow",
        "value": "addNewWorkflow"
    }
]

// module.exports = {
//     updateWatsonConversation: function() {

//     }
// }







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

    controller.on('addFiles',  (bot, message) => addFiles(bot, message));
    controller.on('commit',  (bot, message) => commit(bot, message));
    controller.on('pull',  (bot, message) => pull(bot, message));
    controller.on('push',  (bot, message) => push(bot, message));
  
  
    // listen to everything and send it to Watson
    controller.hears(['.*'], 'direct_message,direct_mention', function (bot, message) {
        try {
            // console.log(JSON.stringify(message));
            if (message) {
                let intents = message.watsonData.intents;
                console.log(JSON.stringify(intents));

                if (!intents.length) handleConfusion(controller, message, bot);
                else handleIntent(controller, intents[0], bot, message);
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
function handleIntent(controller, intent, bot, message) {
    let entities = message.watsonData.entities;
    if (intent.confidence < minimum_confidence) {
        handleConfusion(controller, message, bot);
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
        case "vcPushIntent":
            push(bot,message);
            break;
        case "addNewWorkflow":
            openEditor(bot, message);
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
            var reqBody = {user: "amzn1.ask.account." + process.env.USERID, intent: intent.intent, state: 0};
            bot.startConversation(message, function (err, convo) {
             functions.sendRequest(reqBody).then((r) => {
                    var r_body = JSON.parse(r.body);
                    convo.say(r_body.content);
                      convo.next();
                    });
            console.log("In handleIntent()'s default switch case");
            bot.reply(message, "I don't recognize this intent.");
            })
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

function handleConfusion(controller, message, bot) {
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
                        createExample(controller.conversation, "vcAddFilesIntent", message.text, "testing!!!");
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
                        createExample(controller.conversation,"vcAddFilesIntent", message.text, "testing!!!");  
                        convo.next()
                    }
                }]);
        convo.say("Noted and new example for addFile intent created!");
    });
}

function openEditor(bot, message) {
  // bot.startConversation(message, function(err, convo) {
  //   convo.ask({
  bot.reply(message, 
            {
    "text": "Here's the link to the editor:",
    "attachments": [
        {
            "fallback": "workflow editor",
            "actions": [
                {
                    "type": "button",
                    "name": "Workflow Editor",
                    "text": "Workflow Editor",
                    "url": "file:///Users/anniewang/Desktop/devy/jsplumb-master/editor.html",
                    "style": "primary",
                }
            ]
        }
    ]
}
            ////////////
            // the following version doesnt work but is prettier
            ////////////
    //         {attachments: [
    //     {
    //         "fallback": "openEditor",
    //         "pretext": "Here's the link to the editor:",
    //         "title": "Workflow Editor",
    //         "title_link": "file:///Users/anniewang/Desktop/devy/jsplumb-master/editor.html",
    //         "text": "",
    //         "color": "#7CD197"
    //     }
    // ]}
           );
  //   });
  // });
}









