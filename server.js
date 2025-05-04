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

// Servindo o front-end
app.use(express.static('public'));

// Função para criar o bot
let bot;

function createBot() {
  bot = mineflayer.createBot({
    host: 'survival.406rec.com',  // IP do servidor Minecraft
    port: 25565,                  // Porta padrão do Minecraft
    username: 'Serjao',           // Nome do bot
    password: '12345678',         // Senha do bot
  });

  bot.once('spawn', () => {
    console.log('✅ Bot Serjão conectado ao servidor Minecraft com sucesso!');
    bot.chat('/login 12345678'); // Comando de login do bot
  });

  // Captura as mensagens do chat do servidor Minecraft
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;  // Ignora mensagens do próprio bot
    console.log(`${username}: ${message}`);
    io.emit('chat', { username, message });  // Envia para o cliente do site
  });

  // Reconexão automática se o bot se desconectar
  bot.on('end', () => {
    console.log('🔁 Bot desconectado. Tentando reconectar em 5 segundos...');
    setTimeout(createBot, 5000);  // Recria o bot após 5 segundos
  });

  // Captura erros do bot
  bot.on('error', (err) => {
    console.log('❌ Erro no bot:', err.code || err.message);
  });
}

// Cria o bot na inicialização do servidor
createBot();

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

// Configuração do servidor HTTP para trabalhar com o Socket.io
server.listen(port, () => {
  console.log(`Servidor Express rodando na porta ${port}`);
});
