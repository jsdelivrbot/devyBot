var functions = require("./functions");

module.exports = async function (bot,message, branchName) {
    var reqBody;
    console.log("IN CHECKOUT BRANCH: branchName is "+ branchName);
    reqBody = {intent: "ghCheckoutBranch", state: 0, branchName: branchName};
    try {
        var res = await functions.sendRequest(reqBody);
        var body = JSON.parse(res.body);
        bot.startConversation(message, async function (err, convo) {
        switch(body.state) {
          case "prompt":
            convo.ask(body.content, async function (response, convo){
                console.log("USER RESPONSE IS: " + JSON.stringify(response.text));
                reqBody = {intent: "runTests", state: 1, command: response.text};
                var result = await functions.sendRequest(reqBody);
                convo.say(JSON.parse(result.body).content);
                convo.next();
            });
         break;
    
          case "success":
          case "fail":
            convo.say(body.content);
            convo.next();
            break;
            
          case "error" :
            convo.say(body.content);
            break;
            
          default: 
            console.error("in pull default case");
            break;
                         }
        })
    }
    catch (err) {
        console.error("In runTests, caught an error:" + err);
        return;
    }
}
