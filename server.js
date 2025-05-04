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

// Login automático ao entrar
bot.once('spawn', () => {
  console.log('Bot Serjao conectado com sucesso!');
  bot.chat('/login 12345678');
  bot.chat('§7[§aBot§7] §fSerjão entrou no servidor!');
});

// Captura de mensagens de jogadores
bot.on('chat', (username, message) => {
  if (username !== bot.username) {
    io.emit('chat', { username, message });
    console.log(`${username}: ${message}`);
  }
});

// Captura de mensagens do sistema/servidor
bot.on('message', (jsonMsg) => {
  const message = jsonMsg.toString().replace(/\n/g, ' ').trim();
  if (message && !message.includes('Serjao')) {
    io.emit('chat', { username: 'Servidor', message });
    console.log(`[Servidor]: ${message}`);
  }
});

// Mensagens do site para o jogo
io.on('connection', (socket) => {
  socket.on('send-message', (msg) => {
    if (msg && msg.trim() !== '') {
      bot.chat(msg.trim());
      // Enviar só uma vez com nome do bot
      io.emit('chat', { username: 'Serjao', message: msg.trim() });
    }
  });
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor web rodando na porta ${port}`);
});
