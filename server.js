const express = require('express');
const bodyParser = require('body-parser');
const mineflayer = require('mineflayer');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Criação do bot
const bot = mineflayer.createBot({
  host: 'survival.406rec.com',
  port: 25565,
  username: 'Serjao',
  password: '12345678',
});

// Login e mensagem de entrada
bot.once('spawn', () => {
  console.log('Bot Serjao conectado com sucesso!');
  bot.chat('/login 12345678');
  bot.chat('§7[§aBot§7] §fSerjão entrou no servidor!');
});

// Apenas mensagens reais do chat (não sistema)
bot.on('chat', (username, message) => {
  if (username !== bot.username) {
    io.emit('chat', { username, message });
    console.log(`${username}: ${message}`);
  }
});

// Recebe mensagens do site e envia para o servidor
io.on('connection', (socket) => {
  socket.on('send-message', (msg) => {
    if (msg && msg.trim() !== '') {
      const cleanMsg = msg.trim();
      bot.chat(cleanMsg);
      io.emit('chat', { username: 'Serjao', message: cleanMsg });
      console.log(`Serjao: ${cleanMsg}`);
    }
  });
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor web rodando na porta ${port}`);
});
