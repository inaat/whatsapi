const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fs = require('fs');
//const { phoneNumberFormatter } = require('./helpers/formatter');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');

const _ = require("lodash");
const convert = require("convert-units");
const { lowerCase } = require("lower-case");
const { capitalCase } = require("change-case");
const extractValues = require("extract-values");
const stringSimilarity = require("string-similarity");
const { upperCaseFirst } = require("upper-case-first");


const mainChat = require("./intents/Main_Chat.json");
const supportChat = require("./intents/support.json");
const welcomeChat = require("./intents/Default_Welcome.json");
const fallbackChat = require("./intents/Default_Fallback.json");

let allQustions = [];


allQustions = _.concat(
  allQustions,
  _.flattenDeep(_.map(supportChat, "questions")),
);
allQustions = _.concat(
  allQustions,
  _.flattenDeep(_.map(mainChat, "questions")),
);

allQustions = _.uniq(allQustions);
allQustions = _.compact(allQustions);
const standardRating = 0.6;

const sendAnswer =  (received_sms) => {
  let isFallback = false;
  let responseText = null;
  let rating = 0;
  let action = null;

  
    const query = decodeURIComponent(received_sms).replace(/\s+/g, " ").trim() || "Hello";
    const humanInput = lowerCase(query.replace(/(\?|\.|!)$/gim, ""));

    const regExforUnitConverter = /(convert|change|in).{1,2}(\d{1,8})/gim;
    const regExforSupport = /(invented|programmer|teacher|create|maker|who made|creator|developer|bug|email|report|problems)/gim;

    let similarQuestionObj;
    if (regExforSupport.test(humanInput)) {
      action = "support";
      similarQuestionObj = stringSimilarity.findBestMatch(
        humanInput,
        _.flattenDeep(_.map(supportChat, "questions")),
      ).bestMatch;
    } else {
      action = "main_chat";
      similarQuestionObj = stringSimilarity.findBestMatch(
        humanInput,
        _.flattenDeep(_.map(mainChat, "questions")),
      ).bestMatch;
    }

    const similarQuestionRating = similarQuestionObj.rating;
    const similarQuestion = similarQuestionObj.target;
   
  if (action == "support") {
      rating = similarQuestionRating;

      if (similarQuestionRating > standardRating) {
        for (let i = 0; i < supportChat.length; i++) {
          for (let j = 0; j < supportChat[i].questions.length; j++) {
            if (similarQuestion == supportChat[i].questions[j]) {
              responseText = _.sample(supportChat[i].answers);
            }
          }
        }
      }
    } else if (
      /(?:my name is|I'm|I am) (?!fine|good)(.{1,30})/gim.test(humanInput)
    ) {
      const humanName = /(?:my name is|I'm|I am) (.{1,30})/gim.exec(humanInput);
      responseText = `Nice to meet you ${humanName[1]}.`;
      rating = 1;
    } else {
      action = "main_chat";

      if (similarQuestionRating > standardRating) {
        for (let i = 0; i < mainChat.length; i++) {
          for (let j = 0; j < mainChat[i].questions.length; j++) {
            if (similarQuestion == mainChat[i].questions[j]) {
              responseText = _.sample(mainChat[i].answers);
              rating = similarQuestionRating;
            }
          }
        }
      } else {
        isFallback = true;
        action = "Default_Fallback";
        if (
          humanInput.length >= 5
          && humanInput.length <= 20
          && !/(\s{1,})/gim.test(humanInput)
        ) {
          responseText = "Swat Colligate School Contact Us:0349-3360003!";
        } else {
          responseText = _.sample(fallbackChat);
        }
      }
    }

    if (responseText == null) {
      responseText = _.sample(fallbackChat);
      isFallback = true;
    } 

  return responseText;
  

}

const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
// app.use(express.urlencoded({
//   extended: true
// }));

/**
 * BASED ON MANY QUESTIONS
 * Actually ready mentioned on the tutorials
 * 
 * Many people confused about the warning for file-upload
 * So, we just disabling the debug for simplicity.
 */
app.use(fileUpload({
  debug: false
}));

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  authStrategy: new LocalAuth()
});


client.initialize();

// Socket IO
io.on('connection', function(socket) {

client
    .getState()
    .then((data) => {
      console.log(data);
      if(data.length > 0){
      socket.emit('message', data);
    }else{
      socket.emit('message', 'Connecting...');

    }

    })
    .catch((err) => {
      if (err) {
        try {
          fs.unlinkSync('./whatsapp/session.json');
        } catch {

          
        }
       
      }
    });
  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QR Code received, scan please!');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', 'Whatsapp is ready!');
    socket.emit('message', 'Whatsapp is ready!');
  });

  client.on('authenticated', () => {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp is authenticated!');
    console.log('AUTHENTICATED');
  });

  client.on('auth_failure', function(session) {
    socket.emit('message', 'Auth failure, restarting...');
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', 'Whatsapp is disconnected!');
    client.destroy();
    client.initialize();
  });
});


  client.on('message', message => {
    setTimeout(() => {
    console.log(sendAnswer(message.body));
  message.reply(sendAnswer(message.body));
}, 20000);

});
const checkRegisteredNumber = async function(number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
}

app.get('/checkauth', async (req, res) => {
  client
    .getState()
    .then((data) => {
      res.json(data);
      console.log(444);
    })
    .catch((err) => {
      if (err) {
        try {
          fs.unlinkSync('./whatsapp/session.json');
        } catch {

          res.json('error');
        }
       
      }
    });
});

app.get('/getqr', (req, res) => {
  fs.readFile('./whatsapp/last.qr', (err, last_qr) => {
    fs.readFile('./whatsapp/session.json', (serr, sessiondata) => {
      if (err && sessiondata) {
        next(new Error({ Authenticated: false }));
      } else if (!err && serr) {
        res.json({ qrcode: last_qr.toString() });
        res.end();
      } else {
      }
    });
  });
});

app.post('/send', async (req, res) => {
  let phone =phoneNumberFormatter(req.body.phone);  
  let message = req.body.message;
 if(phone==false){
  io.emit('message','required phone number');
  return res.status(422).json({
    status: false,
    message: 'required phone number'
  });
 }
  
  const isRegisteredNumber = await checkRegisteredNumber(phone);

  if (!isRegisteredNumber) {
    io.emit('message','The number is not registered'+req.body.phone);

    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }
  io.emit('message','Send to:'+req.body.phone);

  setTimeout(() => {
  client
    .sendMessage(phone, message)
    .then((response) => {
      if (response.id.fromMe) {
        //console.log(response);

      // deleteChat(phone)
        res.send({
          status: 'success',
          message: `Message successfully sent to ${phone}`,
        });
      }
    })
    .catch((err) => {
    }) }, 40000);
});


app.post('/group-send', async (req, res) => {
  let group_name = req.body.group_name;
  let message = req.body.message;
  
  client.getChats().then((chats) => {
    const myGroup= chats.find(
      (chat)=> chat.name === group_name
    );  
   // console.log(myGroup);
    if(typeof(myGroup) == "undefined"){
      io.emit('message','this Group is not available');
      return res.status(422).json({
        status: false,
        message: 'this Group is not available '
      });
    }
    setTimeout(() => {
    client.sendMessage(
      myGroup.id._serialized,
      message

    ).then((response) => {
      if (response.id.fromMe) {
        io.emit('message',`Message successfully sent to ${group_name}`);
        res.send({
          status: 'success',
          message: `Message successfully sent to ${group_name}`,
        });
      }
    })
    .catch((err) => {
    })}, 40000);

  });
   
});

function phoneNumberFormatter  (number) {
  // 1. Menghilangkan karakter selain angka
  if(number.length>6){
  let formatted = number.replace(/\D/g, '');

  // 2. Menghilangkan angka 0 di depan (prefix)
  //    Kemudian diganti dengan 62
  if (formatted.startsWith('0')) {
    formatted = '92' + formatted.substr(1);
  }

  if (!formatted.endsWith('@c.us')) {
    formatted += '@c.us';
  }
  
 console.log(formatted);
  return formatted;
}else{
    return false;
}
}
async function archiveChat(phoneNumber) {
  return new Promise(async (resolve, reject) => {
      try {
          const chat = await client.getChatById(phoneNumber);
          console.log("Chat information = ", chat)
          if(!chat.archived){
              chat.archive().then(() => {
                  resolve(`successfuly archived`)
              })
          } else {
              reject(`already archived`)
          }
      } catch (err) {
          if(err.message.includes("Cannot read property 'serialize' of undefined"))
              reject(`do not have chat history`)
              // can handle other error messages...     
      }
  })
}
async function deleteChat(phoneNumber) {
  return new Promise((resolve, reject) => {
      client.getChatById(phoneNumber).then((chat) => {
          console.log("Chat information = ", chat)
          chat.delete().then((deleteRes) => {
              if(deleteRes) 
                  resolve(`successfuly deleted`)
              else 
                  reject("something went wrong")
          })
      }).catch((err) => {
          if(err.message.includes("Cannot read property 'serialize' of undefined"))
              reject(`do not have chat history`)
          // can handle other error messages...     
      })
  })
}

process.setMaxListeners(0);
server.listen(port, function() {
 // console.log('App running on *: ' + port);
});

