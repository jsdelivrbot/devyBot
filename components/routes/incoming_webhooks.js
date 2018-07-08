var debug = require('debug')('botkit:incoming_webhooks');

module.exports = function(webserver, controller) {

    debug('Configured /slack/receive url');
    webserver.post('/slack/receive', function(req, res) {

        // NOTE: we should enforce the token check here

     //  console.log(JSON.stringify(req));
        // respond to Slack that the webhook has been received.
        res.status(200);

        // Now, pass the webhook into be processed
        controller.handleWebhookPayload(req, res);

    });
  
    webserver.post('/devy', function(req, res) {
       console.log(req.body);
       res.status(200);
      res.send();
    });
}
