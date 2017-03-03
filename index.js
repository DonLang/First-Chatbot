// based upon https://chatbotsmagazine.com/have-15-minutes-create-your-own-facebook-messenger-bot-481a7db54892#.7x2w3nwlm

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    "use strict";
    res.send('248237120');

});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    "use strict";
    if (req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});


// Spin up the server
app.listen(app.get('port'), function () {
    "use strict";
    console.log('running on port', app.get('port'));
});
app.post('/webhook/', function (req, res) {
    "use strict";
    var messaging_events = req.body.entry[0].messaging;
    for (var i = 0; i < messaging_events.length; i += 1) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
            if (text === 'Generic') {
                sendGenericMessage(sender);
                continue;
            }
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
        }
        if (event.postback) {
            var text = JSON.stringify(event.postback);
            sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token);
            continue;
        }
    }
    res.sendStatus(200);
});
token = process.env.FB_PAGE_TOKEN;

function sendTextMessage(sender, text) {
    "use strict";
    var messageData = {
        text: text
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

function sendGenericMessage(sender) {
    "use strict";
    var messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: [{
                    title: "First card",
                    subtitle: "Element #1 of an hscroll",
                    image_url: "https://octodex.github.com/images/mcefeeline.jpg",
                    buttons: [{
                        type: "web_url",
                        url: "https://octodex.github.com/",
                        title: "web url"
                    }, {
                        type: "postback",
                        title: "Postback",
                        payload: "Payload for first element in a generic bubble"
                    }]
                }, {
                    title: "Second card",
                    subtitle: "Element #2 of an hscroll",
                    image_url: "https://octodex.github.com/images/privateinvestocat.jpg",
                    buttons: [{
                        type: "postback",
                        title: "Postback",
                        payload: "Payload for second element in a generic bubble"
                    }]

                }]
            }
        }
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};
