const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: 'survival.406rec.com',  // Seu IP do servidor
  port: 25565,
  username: 'SerjaoBot',
  password: '12345678',
});

let botSleeping = false;
let homeCoordinates = { x: 100, y: 64, z: 100 };

// Funções para o bot dormir e acordar
function botSleep() {
  if (botSleeping) return;

  botSleeping = true;
  bot.chat("Vou dormir agora...");
  console.log("Bot está indo dormir...");

  const bed = bot.findBlock({
    matching: 0x04, // ID da cama
    maxDistance: 10
  });

  if (bed) {
    bot.sleep(bed)
      .then(() => {
        console.log("Bot está dormindo...");
        bot.chat("Estou dormindo na cama.");
      })
      .catch((err) => {
        console.log("Erro ao dormir: ", err);
      });
  } else {
    bot.chat("Não encontrei uma cama!");
    console.log("Bot não encontrou cama!");
  }
}

function botWakeUp() {
  if (!botSleeping) return;

  botSleeping = false;
  bot.chat("Estou acordando...");
  console.log("Bot acordou e agora está indo para as coordenadas específicas.");

  bot.moveTo(homeCoordinates).then(() => {
    bot.chat("Cheguei no meu ponto de descanso!");
    console.log("Bot chegou nas coordenadas especificadas.");
  }).catch((err) => {
    console.log("Erro ao mover para o ponto de descanso: ", err);
  });
}

// Websocket para enviar comandos
io.on('connection', (socket) => {
  console.log('Novo usuário conectado.');

  socket.on('command', (command) => {
    if (command === 'dormir' && !botSleeping) {
      botSleep();
    }

    if (command === 'acordar' && botSleeping) {
      botWakeUp();
    }

    socket.emit('botChat', `Comando "${command}" executado.`);
  });

  bot.on('chat', (username, message) => {
    socket.emit('botChat', `${username}: ${message}`);
  });
});

// Servindo arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicializa o servidor
const port = 3000;
http.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
