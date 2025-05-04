const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Criação do servidor HTTP e WebSocket
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configurações do bot
const bot = mineflayer.createBot({
  host: 'survival.406rec.com', // Endereço do servidor Minecraft
  port: 25565, // Porta do servidor Minecraft
  username: 'Serjao', // Nome do bot
  version: '1.21', // Versão do Minecraft
});

// Servindo o front-end
app.use(express.static('public'));

// Conexão do socket.io
io.on('connection', socket => {
  console.log('Usuário conectado');

  // Enviar mensagens do chat do Minecraft para o cliente
  bot.on('chat', (username, message) => {
    // Envia a mensagem do chat do Minecraft para o frontend
    socket.emit('chat', { username, message });
  });

  // Quando o cliente enviar uma mensagem
  socket.on('send-message', (message) => {
    bot.chat(message); // Envia a mensagem para o chat do Minecraft
  });
});

// Comando de login no servidor Minecraft
bot.once('spawn', () => {
  bot.chat('/login 12345678'); // Envia o comando de login no chat do Minecraft

  // Enviar uma mensagem de aviso quando o bot entrar no servidor
  bot.chat('Cheguei rapaziada!');
});

// Iniciar o servidor na porta 3000
server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
