var debug = require('debug')('botkit:incoming_webhooks');
var chai = require('chai'), chaiHttp = require('chai-http');
chai.use(chaiHttp);
module.exports = function(webserver, controller) {

    debug('Configured /slack/receive url');
    webserver.post('/slack/receive', function(req, res) {

        // NOTE: we should enforce the token check here

        // respond to Slack that the webhook has been received.
        res.status(200);
        // Now, pass the webhook into be processed
        controller.handleWebhookPayload(req, res);

    });
  webserver.post('/say', function(req, res) {
       console.log("at /devy endpoint: " + JSON.stringify(req.body));
       var body = req.body;
       chai.request('https://hooks.slack.com')
                .post(body.path)
                .send({text: body.text})
                .then(function (res) {
                    //console.log(res);
                });
       // var bot = controller.spawn({token: process.env.token}).startRTM();
       // bot.reply("something");
       res.status(200);
       res.json(req.body);
    });
}
