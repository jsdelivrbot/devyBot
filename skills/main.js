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
var runTests = require("./runTests");
var createPR = require("./createPR");
var startIssue = require("./startIssue");
var listIssues = require("./listIssues");
var getFileOwner = require("./getFileOwner");
var getCurrentBranch = require("./getCurrentBranch");
var functions = require("./functions");
var checkoutBranch = require("./checkoutBranch");
var createBranch = require("./createBranch");

const minimum_confidence = 0.5;
var sampleMessage = null;
var sampleBot = null;
var issueNumber;
var intentList = [
    {
        "text": "Push code to git",
        "value": "vcPushIntent"
    },
    {
        "text": "Commit code",
        "value": "vcCommitIntent"
    },
    {   "text": "List issues assigned to me",
        "value": "ghListIssuesIntent"
    },
    {
        "text": "Pull code from git",
        "value": "vcPullIntent"
    },
    // {
    //     "text": "Get the owner of the file",
    //     "value": "vcGetFileOwnerIntent"
    // },
    {
        "text": "Run tests",
        "value": "runTests"
    },
    {
        "text": "Add my files",
        "value": "vcAddFilesIntent"
    },
    {
        "text": "Get the current branch",
        "value": "vcGetCurrentBranchIntent"
    },
    // {
    //     "text": "Start working on an issue",
    //     "value": "ghStartIssueIntent"
    // },
    {
        "text": "Create new workflow",
        "value": "addNewWorkflow"
    },
    {
        "text": "Create new pull request",
        "value": "createPR"
    },
    {
        "text": "Check out a branch",
        "value": "ghCheckoutBranch"
    },
    {
        "text": "Create a branch",
        "value": "createBranch"
    }
  
]

module.exports = {
  setIssueNumber: function(num) {
    console.log("setting current issue number to "+num);
    issueNumber = num;
  },
  main: function (controller) {

    // triggers are defined here
    controller.on('add files',  () => addFiles(sampleBot, sampleMessage));
    controller.on('commit',  () => commit(sampleBot, sampleMessage));
    controller.on('pull',  () => pull(sampleBot, sampleMessage));
    controller.on('push',  () => push(sampleBot, sampleMessage));
    controller.on('run tests', (body) => runTests(sampleBot, sampleMessage, body));
    controller.on('createPR', () => createPR(sampleBot, sampleMessage));
    controller.on('list issues', () => listIssues(sampleBot, sampleMessage));
    controller.on('getFileOwner', () => getFileOwner(sampleBot, sampleMessage));
    controller.on('getCurrentBranch', () => getCurrentBranch(sampleBot, sampleMessage));
    controller.on('check out a branch', (branchName) => checkoutBranch(sampleBot, sampleMessage, branchName));
    controller.on('customized command', (command) => customCommand(sampleBot,sampleMessage,command));
    controller.on('create a branch', (num) => createBranch(sampleBot,sampleMessage,num));
    // listen to everything and send it to Watson
    controller.hears(['.*'], 'direct_message,direct_mention', function (bot, message) {
        try {
            sampleBot = bot;
            sampleMessage = message;
            console.log("user is "+message.user); // user is UASR6U42J, channel: 'DAW4Q7A5C'
            functions.setUserID(message.user);
            if (message) {
                let intents = message.watsonData.intents;
                // console.log(JSON.stringify(intents));

                if (!intents.length) handleConfusion(controller, message, bot);
                else handleIntent(controller, intents[0], bot, message);
            }
        } catch (err) {
            bot.say(message, "I'm sorry, but for technical reasons I can't respond to your message");
            console.log(err);
        }
    });
}
}


// takes in the intent returned by Watson
// if the confidence of the intent is lower than the set threshold, 
// it calls handleConfusion
function handleIntent(controller, intent, bot, message) {
    let entities = message.watsonData.entities;
    let num_of_entities;
    let startPos;
    let endPos;
    let issueNumber2;
    // if the intent has too low a confidence, there is a high chance that there is a confusion
    if (intent.confidence < minimum_confidence) {
        return handleConfusion(controller, message, bot);
    }
    switch (intent.intent) {
        case "getUserID":
            bot.reply(message, "Your user ID is "+message.user);
            break;
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
        case "runTests":
            runTests(bot, message, null);
            break;
        case "createPR":
            createPR(bot, message);
            break;
        case "ghListIssuesIntent":
            listIssues(bot, message);
            break;
        case "vcGetFileOwnerIntent":
            getFileOwner(bot, message);
            break;
        case "vcGetCurrentBranchIntent":
            getCurrentBranch(bot, message);
            break;
        case "customized command":
            customCommand(bot, message);
            break;
        case "createBranch":
            if (issueNumber!=0) return createBranch(bot, message, issueNumber);
            num_of_entities = entities.length;
            if (num_of_entities > 0) {
              startPos = entities[num_of_entities - 1].location[0];
              endPos = entities[num_of_entities - 1].location[1];
              issueNumber2 = message.text.substring(startPos, endPos);
              console.log(entities);
            }
            createBranch(bot, message, issueNumber2);
            break;
        // case "ghStartIssueIntent":
        //     num_of_entities = entities.length;
        //     startPos = entities[num_of_entities - 1].location[0];
        //     endPos = entities[num_of_entities - 1].location[1];
        //     issueNumber = message.text.substring(startPos, endPos);
        //     console.log(entities);
        //     startIssue(bot, message, issueNumber);
        //     // bot.reply(message, "I've switched you to branch " + issueNumber + " Let me know when you're finished.");
        //     break;
        case "ghCheckoutBranch" :
            console.log("ENTITIES: "+entities);
            var branchName;
            // I'm getting the value of branch name out manually here,
            // assuming that the branch name should be at the end of the sentense,
            // aka the user would say things like "check out branch master"
            if (entities.length>0) {
                let startPos = entities[0].location[0];
                let endPos = entities[0].location[1];
                branchName = message.text.substring(startPos, endPos);
                console.log("BRANCH NAME IS "+branchName);
                checkoutBranch(bot, message, branchName);
            } else {
                // this prompt is for the case where the program 
                // fails to extract the name of the branch in the previous trigger message
                bot.startConversation(message, function (err, convo) {
                  convo.ask('Could you repeat the name of the branch?', function (reply, convo){
                    branchName = reply.text;
                    checkoutBranch(bot, message, branchName);
                    convo.next();
                  })
                  convo.next();
                });
            }
            break;
        default:
            // when the intent is not one of the cases above, it can only be a customized workflow intent,
            // thus the bot should forward it to the client program and let it recognize the workflow intent
            var reqBody = {intent: intent.intent, state: 0};
             functions.sendRequest(reqBody).then((r) => {
                    var r_body = JSON.parse(r.body);
                    bot.reply(message, r_body);
                    });
            console.log("In handleIntent()'s default switch case");
            // bot.reply(message, "I don't recognize this intent.");
            break;
    }
  
  
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
}


// on confusion, the bot prompts the user and ask for the intent of a previous message, 
// and create a new example with the message text for the specified intent on watson workspace.
// if new intent cases is created, the intentList variable which gives the intent options to the user in this prompt
// should be updated too.
function handleConfusion(controller, message, bot) {
    var patterns = [];
    for (var i in intentList) {
      patterns.push({
        pattern: intentList[i],
                    callback: function (reply, convo) {
                      console.log(reply.text);
                        functions.createExample(controller.conversation, reply.text, message.text, "example created by devy");
                        controller.trigger(reply.text);
                        convo.next();
                    }
      });
    }
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
            }, patterns);
    });
}


// on the "open workflow editor" intent, this function simply asks for the relative path of the html file 
// from the client program, and then sends user the link. 
// Once the user clicks on the link, the local file, aka workflow editor UI should be opened in the browser. 
async function openEditor(bot, message) {
  // bot.startConversation(message, function(err, convo) {
  //   convo.ask({
  var link = await functions.sendRequest({intent: "addNewWorkflow"});
  console.log(link.body);
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
                    "url": "file://"+JSON.parse(link.body).content,
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

// this function is only expected to be triggered by the client program as a step of a workflow.
// the command should be specified in the request from the client program
async function customCommand(bot, message,command){
    var res = await functions.sendRequest({intent: "customized command", command: command});
    console.log(res.body);
    bot.reply(message, JSON.parse(res.body).content);
}
