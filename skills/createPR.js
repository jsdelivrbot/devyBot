var functions = require("./functions");

module.exports = async function (bot,message) {
    var reqBody;
    reqBody = {intent: "createPR", state: 0};
    try {
        var res = await functions.sendRequest(reqBody);
        var body = JSON.parse(res.body);
        bot.startConversation(message, async function (err, convo) {
        switch(body.state) {
          case "prompt":
            convo.ask(body.content, async function (response, convo){
                console.log("USER RESPONSE IS: " + JSON.stringify(response.text));
                reqBody = {intent: "createPR", state: 1, issueNumber: response.text};
                var result = await functions.sendRequest(reqBody);
                convo.say(JSON.parse(result.body).content);
                convo.next();
            });
         break;
          
          case "PRexist":
          case "created":
            convo.say(body.content);
            convo.next();
            break;
            
          default: 
            console.error("in pull default case");
            convo.say(body.content);
            break;
                         }
        })
    }
    catch (err) {
        console.error("In runTests, caught an error:" + err);
        return;
    }
}
