/*

Interactive part of Devy bot. 
Switch cases according to both intents from Watson and the context data of the user
Mocking data only so far. Consider loading context variables as local varables first and then access in code?

*/

//
var request = require('request');
var http = require('http');

const minimum_confidence = 0.5;

var fileNames = [];
  fileNames.push('example1.js');
  fileNames.push('example2.js');
  fileNames.push('example3.js');

var watson = require('watson-developer-cloud');
var conversation = new watson.ConversationV1({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  workspace_id: process.env.WORKSPACE_ID,
  version_date: '2018-05-30',
});

function createExample(intent, example, description=null){
  var params = {
  workspace_id: process.env.WORKSPACE_ID,
  intent: intent,
  text: example
};
  conversation.createExample(params, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(response, null, 2));
  } 
});
}


module.exports = function(controller) {

  // addFiles intent

  

    // controller.hears(['add','files'], 'direct_message,direct_mention', function(bot, message) {
    //     // addFiles intent
    //   addFiles(bot, message, fileNames);
    // });

    // controller.hears(['commit'], 'direct_message,direct_mention', function(bot, message) {
    //     bot.createConversation(message, function(err, convo) {
    //        var number = 0;
    //       switch (number) {
    //         case 0:
    //           // Done
    //           convo.say('Ok, I\'ve committed your files.');
    //           break;
    //         case 1:
    //           // CommitUntracked
    //           convo.ask({
    //             attachments: [
    //               {text:
    //             '"There are no tracked changes but there are untracked files. Should I commit them?"',
    //                callback_id: 'CommitUntracked',
    //             attachment_type: 'default',
    //             actions: [
    //                 {
    //                     "name":"yes",
    //                     "text": "Yes",
    //                     "value": "yes",
    //                     "type": "button",
    //                 },
    //                 {
    //                     "name":"no",
    //                     "text": "No",
    //                     "value": "no",
    //                     "type": "button",
    //                 }
    //             ]
    //               }]},
    //                    [{
    //                      // and then commit the files?
    //                      pattern: "yes",
    //                      callback: function(reply, convo){
    //                         convo.say('Ok, I\'ve committed your files.');
    //                         convo.next();
    //                      }},
    //                     {
    //                       // and then not commit anything?
    //                      pattern: "no",
    //                      callback: function(reply, convo){
    //                         convo.say('There is nothing to commit.');
    //                         convo.next();
    //                      }}
    //                    ]);
    //           break;
    //         case 0:
    //           // Done
    //           convo.say('Ok, I\'ve committed your files.');
    //           break;
    //         case 0:
    //           // Done
    //           convo.say('Ok, I\'ve committed your files.');
    //           break;
    //         default:
    //           break;
    //                     }
    //     })
    // })


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

  controller.hears(['.*'], 'direct_message,direct_mention', function(bot, message) {

  //   if (message.watsonError) {
  //   console.log("I'm sorry, but for technical reasons I can't respond to your message");
  // } else {
    console.log(JSON.stringify(message.watsonData));
    if (message) {
    let intents = message.watsonData.intents;
    console.log(JSON.stringify(intents));
    
    if (!intents.length) handleConfusion(message,bot);
    else handleIntent(intents[0],bot,message);
    
    }
  });
}

function handleIntent(intent, bot, message) {
      let entities = message.watsonData.entities;
      if (intent.confidence < minimum_confidence) {
      handleConfusion(message, bot);
    }
      
    if (intent.intent == "vcAddFilesIntent")
      addFiles(bot, message, fileNames);
    
    if (intent.intent == "ghStartIssueIntent") {
      let num_of_entities = entities.length;
      console.log(typeof num_of_entities);
      let startPos = entities[num_of_entities-1].location[0];
      let endPos = entities[num_of_entities-1].location[1];
      let issueBranch = message.text.substring(startPos,endPos);
      bot.reply(message, "I've switched you to branch " + issueBranch + " Let me know when you're finished.");
    }
}

function handleConfusion(message,bot) {
    bot.startConversation(message, function(err, convo) {
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
                    "options": [
                        {
                            "text": "Push code to git",
                            "value": "push"
                        },
                        {
                            "text": "Commit code",
                            "value": "commit"
                        },
                        {
                            "text": "Pull code from git",
                            "value": "pull"
                        },
                        {
                            "text": "Get the owner of the file",
                            "value": "ownerOfFile"
                        },
                        {
                            "text": "Add my files",
                            "value": "addFile"
                        },
                        {
                            "text": "Get the current branch",
                            "value": "getCurrentBranch"
                        },
                        {
                            "text": "Start working on an issue",
                            "value": "startOnIssue"
                        }
                    ]
                }
            ]
        }
    ]
},[
  {
            pattern: "addFile",
            callback: function(reply, convo) {
              // !!!
              convo.say("Noted and new example for addFile intent created!");
              console.log(message.text);
              createExample("vcAddFilesIntent", message.text, "testing!!!");
              addFiles(bot, message, fileNames);
              convo.next();
            }
  },
  {
            pattern: "commit",
            callback: function(reply, convo) {
              // !!!
              convo.say("Noted and new example for commit intent created!");
              console.log(message.text);
              // createExample("vcAddFilesIntent", message.text, "testing!!!");  
              var options = {
                host: 'skaha.cs.ubc.ca',
                path: '/alexa/devy',
                method: 'POST',
                body: {value:'test'}
              };
              http.request(options, function(res, err) {
                if (err) console.log(err);
                console.log(res);
              });
              convo.next();
            }
  },
]
      ); 
    })
}
  
  
function addFiles(bot, message, fileNames) {
  if (fileNames.length == 0) {
    bot.startConversation(message, function(err, convo) {
        convo.say('There were no untracked files to add.');
        convo.next();
    });
    return;
  }
      var reply_1 = 'Would you like me to add the following '+fileNames.length.toString()+' file(s)?';
      var reply_2 = '';
      for (let i in fileNames) {
        reply_2 = reply_2.concat('\n');
        reply_2 = reply_2.concat(fileNames[i]);
      }
  bot.startConversation(message, function(err, convo) {
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
                        "name":"yas",
                        "text": "Yes",
                        "value": "yes",
                        "type": "button",
                    },
                    {
                        "name":"no",
                        "text": "No",
                        "value": "no",
                        "type": "button",
                    },
                    {
                        "name":"cancel",
                        "text": "Cancel",
                        "value": "cancel",
                        "type": "button",
                    }
                ]
          }
        ]
        },[
          {
            pattern: "yes",
            callback: function(reply, convo) {
              // !!!
                convo.say('OK, I\'ve added your files.');
                convo.next();
            }
        },
          {
            pattern: "cancel",
            callback: function(reply, convo) {
                convo.say('OK, action canceled!');
                convo.next();
            }
        },
        {
            pattern: "no",
            callback: function(reply, convo) {
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
                    callback: function(reply, convo2) {
                    convo.say(fileNames[i] + ' is removed from the adding list!');
                    // delete fileNames[i];
                    fileNames.splice(i,1);
                    convo.next();
                    addFiles(bot, message, fileNames);
                   }});
                }
               convo.say('Let\'s review the files then:');
              let attachments_object = {};
              attachments_object.attachments = attachments;
               convo.ask(
                  attachments_object,
                  patterns);
               convo.next();
        }}]);
    });
}