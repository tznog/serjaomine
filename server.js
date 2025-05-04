// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const mineflayer = require('mineflayer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let bot;
const homeCoordinates = { x: 763, y: 191, z: 2963 }; // Ajuste conforme necessário

function createBot() {
  bot = mineflayer.createBot({
    host: 'survival.406rec.com',
    port: 25565,
    username: 'Serjao',
    version: '1.21.4',
  });

  bot.on('login', () => {
    console.log('Bot conectado!');
    bot.chat('/login 12345678');
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    io.emit('chat', `${username}: ${message}`);
  });

  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString();
    io.emit('chat', `§r${msg}`);
  });

  bot.on('end', () => {
    console.log('Bot desconectado, tentando reconectar em 10s...');
    setTimeout(createBot, 10000);
  });

  bot.on('error', err => {
    console.error('Erro do bot:', err);
  });
}

createBot();

function botSleep() {
  const bed = bot.findBlock({ matching: block => bot.isABed(block) });
  if (!bed) {
    bot.chat('Não encontrei nenhuma cama por perto!');
    return;
  }
  bot.chat('Indo dormir...');
  bot.sleep(bed, (err) => {
    if (err) {
      bot.chat('Erro ao tentar dormir: ' + err.message);
    } else {
      bot.chat('Boa noite! 😴');
    }
  });
}

function botWakeUp() {
  if (!bot.isSleeping) {
    bot.chat('Eu nem estou dormindo...');
    return;
  }
  bot.chat('Acordando! ☀️');
  bot.wake((err) => {
    if (err) {
      bot.chat('Erro ao acordar: ' + err.message);
    } else {
      bot.chat('Bom dia! Voltando para casa...');
      bot.chat(`/tp ${homeCoordinates.x} ${homeCoordinates.y} ${homeCoordinates.z}`);
    }
  });
}

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('sendChat', (msg) => {
    if (bot && bot.chat) {
      bot.chat(msg);
    }
  });

  socket.on('sendCommand', (cmd) => {
    if (!bot) return;
    if (cmd === 'sleep') {
      botSleep();
    } else if (cmd === 'wake') {
      botWakeUp();
    } else {
      bot.chat(cmd);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
