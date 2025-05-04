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

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let bot;

function createBot() {
  bot = mineflayer.createBot({
    host: 'survival.406rec.com',
    port: 25565,
    username: 'Serjao',
    password: '12345678',
    // version: '1.20.4' // Adicione aqui se souber a versão exata do servidor
  });

  bot.once('spawn', () => {
    console.log('Bot Serjao conectado ao servidor Minecraft com sucesso!');
    bot.chat('/login 12345678');
    bot.chat('O Serjão está online!');
  });

  // Captura mensagens do chat dos jogadores
  bot.on('chat', (username, message) => {
    if (username === bot.username) return; // Ignora mensagens duplicadas
    io.emit('chat message', `${username}: ${message}`);
  });

  // Tratamento de erro para evitar que o bot derrube o servidor
  bot.on('error', (err) => {
    console.error('Erro no bot:', err);
  });

  bot.on('end', () => {
    console.warn('Bot foi desconectado. Tentando reconectar em 10 segundos...');
    setTimeout(createBot, 10000); // Reconecta após 10 segundos
  });
}

// Cria o bot inicialmente
createBot();

// Rota para envio de mensagens do site
app.post('/send-message', (req, res) => {
  const { message } = req.body;

  if (!message || !bot) {
    return res.status(400).send({ error: 'Mensagem inválida ou bot desconectado.' });
  }

  bot.chat(message);
  io.emit('chat message', `Serjao: ${message}`);
  return res.status(200).send({ message: 'Mensagem enviada!' });
});

// Comunicação com o front-end via WebSocket
io.on('connection', (socket) => {
  console.log('Usuário conectado ao chat');

  socket.on('disconnect', () => {
    console.log('Usuário desconectado do chat');
  });
});

server.listen(port, () => {
  console.log(`Servidor Express rodando na porta ${port}`);
});
