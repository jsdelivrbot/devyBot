/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's conversation system.

In this example, Botkit hears a keyword, then asks a question. Different paths
through the conversation are chosen based on the user's response.

*/

function addFiles(bot, message, fileNames) {
  if (fileNames.length == 0) {
    bot.startConversation(message, function(err, convo) {
        convo.say('There were no untracked files to add.');
        convo.next();
    });
    return;
  } 
      var reply_1 = 'Would you like me to add the following '+fileNames.length.toString()+'file(s)?';
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

module.exports = function(controller) {
  
  // addFiles intent
  
  var fileNames = [];
  fileNames.push('example1.js');
  fileNames.push('example2.js');
  fileNames.push('example3.js');
  
    controller.hears(['add','files'], 'direct_message,direct_mention', function(bot, message) {
        // addFiles intent
      addFiles(bot, message, fileNames);
    });

    controller.hears(['commit'], 'direct_message,direct_mention', function(bot, message) {

        // commit intent
        bot.createConversation(message, function(err, convo) {
          
            // create a path for when a user says YES
            convo.addMessage({
                    text: 'How wonderful.',
            },'yes_thread');

            // create a path for when a user says NO
            // mark the conversation as unsuccessful at the end
            convo.addMessage({
                text: 'Cheese! It is not for everyone.',
                action: 'stop', // this marks the converation as unsuccessful
            },'no_thread');

            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage({
                text: 'Sorry I did not understand. Say `yes` or `no`',
                action: 'default',
            },'bad_response');

            // Create a yes/no question in the default thread...
            convo.ask('version1', [
                {
                    pattern:  bot.utterances.yes,
                    callback: function(response, convo) {
                        convo.gotoThread('yes_thread');
                    },
                },
                {
                    pattern:  bot.utterances.no,
                    callback: function(response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ]);

            convo.activate();

            // capture the results of the conversation and see what happened...
            convo.on('end', function(convo) {

                if (convo.successful()) {
                    // this still works to send individual replies...
                    bot.reply(message, 'Let us eat some!');

                    // and now deliver cheese via tcp/ip...
                }

            });
        });

    });
  
  controller.hears(['*'], 'direct_message,direct_mention', function(bot, message) {
    
    bot.createConversation(message, function(err, convo) {
        convo.say('default reply');
    });
    
  });

}
