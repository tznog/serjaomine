const express = require('express');
const bodyParser = require('body-parser');
const mineflayer = require('mineflayer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

// Configuração do Express para lidar com requisições JSON
app.use(bodyParser.json());

// Servir o arquivo index.html na rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Criação do bot "Serjao"
const bot = mineflayer.createBot({
  host: 'survival.406rec.com',  // IP do servidor Minecraft
  port: 25565,                  // Porta padrão do Minecraft
  username: 'Serjao',           // Nome do bot
  password: '12345678',         // Senha do bot
});

// Quando o bot se conectar com sucesso ao servidor
bot.once('spawn', () => {
  console.log('Bot Serjao conectado ao servidor Minecraft com sucesso!');
  // Avisar no chat do servidor quando o bot entra
  bot.chat('Bot Serjao entrou no servidor!');
  // Emitir uma mensagem de boas-vindas para o chat do site
  io.emit('chat', { username: 'Bot Serjao', message: 'Bot Serjao entrou no servidor!' });
});

// Quando o bot recebe uma mensagem no chat do Minecraft
bot.on('chat', (username, message) => {
  console.log(`${username}: ${message}`);
  // Emitir a mensagem de chat para o site
  io.emit('chat', { username, message });
});

// Endereço de API para enviar mensagens ao Minecraft
app.post('/send-message', (req, res) => {
  const { message } = req.body;
  
  // Verificação se a mensagem existe
  if (!message) {
    return res.status(400).send({ error: 'Mensagem inválida' });
  }

  // Enviar a mensagem para o Minecraft
  bot.chat(message);
  console.log(`Mensagem enviada para Minecraft: ${message}`);

  // Retorno de sucesso
  return res.status(200).send({ message: 'Mensagem enviada!' });
});

// Iniciar o servidor Express
server.listen(port, () => {
  console.log(`Servidor Express rodando na porta ${port}`);
});
