var addFiles = require("../../skills/addFiles");
var commit = require("../../skills/commit");
var pull = require("../../skills/pull");
var push = require("../../skills/push");

var debug = require('debug')('botkit:incoming_webhooks');
var chai = require('chai'), chaiHttp = require('chai-http');
chai.use(chaiHttp);
var bot = require('../../bot'); 
module.exports = async function(webserver, controller) {

    debug('Configured /slack/receive url');
    webserver.post('/slack/receive', function(req, res) {

        // NOTE: we should enforce the token check here

        // respond to Slack that the webhook has been received.
        res.status(200);
        // Now, pass the webhook into be processed
        controller.handleWebhookPayload(req, res);

    });
  
    webserver.post('/workflow', function(req, res) {
      try {
       console.log("at /workflow endpoint: " + JSON.stringify(req.body));
       var body = req.body;
      chai.request('https://skaha.cs.ubc.ca:443')
        .post('/test')
        .send(body)
        .then(function (res2) {
            console.log(res2.body);
            var res2 = JSON.parse(res2.body);
            chai.request('https://hooks.slack.com')
                .post(res2.path)
                .send({text: res2.text})
                .then(()=>{
                   var params = {
                       workspace_id: process.env.WORKSPACE_ID,
                        name: 'Updated workspace',
                        description: 'Test workspace modified via API.'};
                   controller.conversation.updateWorkspace(params, function(err, response) {
                    if (err) {
                        console.error(err);
                    } else {
                    console.log(JSON.stringify(response, null, 2));}
                      });
                    console.log(bot);
                    //console.log(main);//.updateWatsonConversation();
                    console.log("new workflow created");
            })
       });
       res.status(200);
       res.json(req.body);
    }catch(err)
    {}});
  
      webserver.post('/say', function(req, res) {
         console.log("at /say endpoint: " + JSON.stringify(req.body));
         var body = req.body;
         chai.request('https://hooks.slack.com')
                .post(body.path)
                .send({text: body.text})
        res.status(200);
        res.json("success");
      })
  
      webserver.post('/trigger', function(req, res) {
        var body = req.body;
        controller.trigger(body,[bot,body]);
        res.status(200);
        res.json("success");
        })
}
    
