const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mineflayer = require('mineflayer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let bot;

function createBot() {
  bot = mineflayer.createBot({
    host: 'survival.406rec.com',
    port: 25565,
    username: 'Serjao',
    version: '1.21'
  });

  bot.once('spawn', () => {
    console.log('✅ Bot entrou no servidor!');
    bot.chat('/login 12345678');
  });

  bot.on('chat', (username, message) => {
    if (username !== bot.username) {
      io.emit('chat', { username, message });
    }
  });

  bot.on('end', () => {
    console.log('⚠️ Bot caiu. Reconectando em 5s...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', (err) => {
    console.error('❌ Erro no bot:', err.message);
  });
}

createBot();

io.on('connection', (socket) => {
  socket.on('send-message', (msg) => {
    if (bot && bot.chat) bot.chat(msg);
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Servidor web escutando na porta ${PORT}`);
});
