var request = require('request');
var http = require('http');
var chai = require('chai'), chaiHttp = require('chai-http');
chai.use(chaiHttp);

module.exports = {
  
  // sends request to proxy. takes in the body part of the request
  sendRequest: async function sendRequest(body) {
    body.user = "amzn1.ask.account." + process.env.USERID,

    console.log("Sending to proxy: " + JSON.stringify(body));
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
  },
  
  tellBotToSay: function (message, path) {
         chai.request('https://hooks.slack.com')
                .post(path)
                .send({text: message})
  },
  
  // takes the intent name and the new text example,
  // uploads to Watson so new example of the intent will be added accordingly
  // description is optional
  createExample: function createExample(conversation, intent, example, description=null) {
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
  },
  
  // update watson after a new workflow is created
  updateWatson: function (controller){
        
  }
}