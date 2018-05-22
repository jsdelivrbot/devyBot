/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's conversation system.

In this example, Botkit hears a keyword, then asks a question. Different paths
through the conversation are chosen based on the user's response.

*/

module.exports = function(controller) {

  // addFiles intent
    controller.hears(['add','files'], 'direct_message,direct_mention', function(bot, message) {

      // reply should be received from back-end
      var reply1 = 'Would you like me to add the following files?';
      var reply2 = '';
      var fileNames = [];
      fileNames.push('example1.js');
      fileNames.push('example2.js');
      for (let i of fileNames) {
        reply2 = reply2.concat('\n');
        reply2 = reply2.concat(i);
      }
      bot.startConversation(message, function(err, convo) {
        convo.ask({
        attachments: [
          {
            title: reply1,
            text: reply2,
            // !!! figure out this callback_id
                callback_id: '123',
                attachment_type: 'default',
                actions: [
                    {
                        "name":"yes",
                        "text": "Yes",
                        "value": "yes",
                        "type": "button",
                    },
                    {
                        "name":"no",
                        "text": "No",
                        "value": "no",
                        "type": "button",
                    }
                ]
          }
        ]
        },[
          {
            pattern: "yes",
            callback: function(reply, convo) {
                convo.say('Done!');
                convo.next();
            }
        },
        {
            pattern: "no",
            callback: function(reply, convo) {
                convo.say('Let\'s review the files then:');
                convo.next();
                // DO SOMETHING
              convo.ask({
                  attachments: [
                 {
                  title: reply1,
                  text: reply2,
            // !!! figure out this callback_id
                callback_id: '123',
                attachment_type: 'default',
                actions: [
                    {
                        "name":"yes",
                        "text": "Yes",
                        "value": "yes",
                        "type": "button",
                    },
                    {
                        "name":"no",
                        "text": "No",
                        "value": "no",
                        "type": "button",
                    }
                ]
          }
        ]
        }
            }
        },
        {
            default: true,
            callback: function(reply, convo) {
                // do nothing
            }
        }])
      });
      
//       if (
//         bot.startConversation(message, function(err, convo) {
          
        
//             convo.ask('What is your favorite color?', function(response, convo) {

//                 convo.say('Cool, I like ' + response.text + ' too!');
//                 convo.next();

//             });
    });
    


    controller.hears(['commit'], 'direct_message,direct_mention', function(bot, message) {

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
