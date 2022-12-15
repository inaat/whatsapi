// const qrcode = require('qrcode-terminal');
// const fs = require("fs")
// const { Client, LegacySessionAuth, LocalAuth } = require('whatsapp-web.js');


// // Path donde la sesión va a estar guardada
// //NO ES NECESARIO
// const SESSION_FILE_PATH = './whatsapp/session.json';

// // Cargar sesión en caso de que exista una ya guardada
// //NO ES NECESARIOc
// let sessionData;
// if(fs.existsSync(SESSION_FILE_PATH)) {
//    sessionData = require(SESSION_FILE_PATH);
// }

// // Uso de valores guardados
// // ¡LINEA MODIFICADA!
// //const client = new Client({
// //    authStrategy: new LegacySessionAuth({
// //        session: sessionData
// //    })
// //});
// global.client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: {
//     handleSIGINT: false,
//     args: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--unhandled-rejections=strict',
//       '--disable-extensions',
//     ] }
// });




// client.on('qr', (qr) => {
//   fs.writeFileSync('./whatsapp/last.qr', qr);
//   qrcode.generate(qr, {small: true} );

// });


// client.on('authenticated', (session) => {
//   console.log('AUTH!');
//   sessionDat = session;

//   fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
//     if (err) {
//       console.error(err);
//     }
//     authed = true;
//   });

//   try {
//     fs.unlinkSync('./whatsapp/last.qr');
//   } catch (err) {}
// });




// client.on('auth_failure', () => {
//   console.log('AUTH Failed !');
//   sessionDat = '';
//   process.exit();
// });

// client.on('ready', () => {
//   console.log('Client is ready!');
// });

// // const send_message = [
// //     "923439706784",
// //     "923439706784",
// //     "923439706784",
// //     "923439706784"
// // ]

// // client.on("ready", () => {
// //     console.log("Listo")

// //     send_message.map(value => {
// //         const chatId = value +"@c.us"
// //         message = "kamza ye"
// //         client.sendMessage(chatId,message);
// // })
// // })

// // client.on("ready", () => {
// //     console.log("Client is ready!");

// //     setTimeout(() => {
// //         send_message.map(value => {
// //             const chatId = value +"@c.us"
// //             message = "kamza ye 330003"
// //             client.sendMessage(chatId,message).then((response) => {
// //                 if (response.id.fromMe) {
// //                     console.log("It works!");
// //                 }
// //             });
            
// //     })
// //     }, 5000);
// // });
// client.initialize();













const qrcode = require('qrcode-terminal');
const fs = require("fs")
const { Client, LegacySessionAuth, LocalAuth } = require('whatsapp-web.js');


// Path donde la sesión va a estar guardada
//NO ES NECESARIO
const SESSION_FILE_PATH = './whatsapp/session.json';

// Cargar sesión en caso de que exista una ya guardada
//NO ES NECESARIOc
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
   sessionData = require(SESSION_FILE_PATH);
}

// Uso de valores guardados
// ¡LINEA MODIFICADA!
//const client = new Client({
//    authStrategy: new LegacySessionAuth({
//        session: sessionData
//    })
//});
// global.client = new Client({
//      authStrategy: new LocalAuth({
//           clientId: "client-one",
//           session: sessionData
//           //Un identificador(Sugiero que no lo modifiques)
//      })
// })
global.client =new Client({
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

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    //NO ES NECESARIO PERO SI QUIERES AGREGAS UN console.log
    //sessionData = session;
    //fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
    //    if (err) {
    //        console.error(err);
    //    }
    //});
});
 

client.initialize();
// client.on("qr", qr => {
//     console.log('QR RECEIVED', qr);
//     qrcode.generate(qr, {small: true} );
//     fs.writeFileSync('./whatsapp/last.qr', qr);
// })


const send_message = [
    "923439706784",
    "923439706784",
    "923439706784",
    "923439706784"
]

// client.on("ready", () => {
//     console.log("Listo")

//     send_message.map(value => {
//         const chatId = value +"@c.us"
//         message = "kamza ye"
//         client.sendMessage(chatId,message);
// })
// })

// client.on("ready", () => {
//     console.log("Client is ready!");

    
// });