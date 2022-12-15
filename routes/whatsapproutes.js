const express = require('express');
const router = express.Router();
const fs = require('fs');


module.exports = router;



router.get('/checkauth', async (req, res) => {
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

router.get('/getqr', (req, res) => {
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

router.post('/send', async (req, res) => {
  let phone = req.body.phone;
  let message = req.body.message;

  setTimeout(() => {
  client
    .sendMessage(phoneNumberFormatter(phone), message)
    .then((response) => {
      if (response.id.fromMe) {
        res.send({
          status: 'success',
          message: `Message successfully sent to ${phone}`,
        });
      }
    })
    .catch((err) => {
    }) }, 500);
});


router.post('/group-send', async (req, res) => {
  let group_name = req.body.group_name;
  let message = req.body.message;
  setTimeout(() => {
  client.getChats().then((chats) => {
    const myGroup= chats.find(
      (chat)=> chat.name === group_name
    );  
    console.log(myGroup);
    client.sendMessage(
      myGroup.id._serialized,
      message


    ).then((response) => {
      if (response.id.fromMe) {
        res.send({
          status: 'success',
          message: `Message successfully sent to ${group_name}`,
        });
      }
    })
    .catch((err) => {
    })}, 500);

  });
   
});

function phoneNumberFormatter  (number) {
  // 1. Menghilangkan karakter selain angka
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
}

