# Slack Bot for Devy

This is the chat bot program for Devy. 

### Installation

Fill the `.env` file with your newly acquired tokens from both the Watson Conversation and the slack application. 

Launch the bot application by typing:

`node .`

Now, visit the bot's [login page](http://localhost:3000/login).


Continue your journey to becoming a champion botmaster by [reading the Botkit Studio SDK documentation here.](https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md)


### How it works

The chat bot program is built on top of the Botkit slack bot program. 

`skills/main.js`  is the main controller file that listens to the messages sent by the user to the chatbot. Upon receiving a message, it sends the text to the Watson Conversation (connected on starting of the program) and expect an intent. If zero intent is sent back or the intent has too low a confidence score, the bot will prompt the user with a selection of options and train the Watson Conversation with the new example the user has previously provided.

Other files in the `skills/` folder are functions that will be called accordingly if a certain intent is triggered from either a message sent by the user or the client program as a step of a customized workflow. The logic in these files are similar: it sends a request to the client program and then respond to the user with a message, which is the main interactive part of the project.

