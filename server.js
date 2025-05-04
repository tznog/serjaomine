const express = require('express');
const path = require('path');
const mineflayer = require('mineflayer');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Criar o bot
const bot = mineflayer.createBot({
  host: 'survival.406rec.com',  // IP do servidor Minecraft
  port: 25565,
  username: 'Serjao',
  password: '12345678',
});

// Login automatizado quando o bot se conecta ao servidor
bot.on('spawn', () => {
  console.log('Bot entrou no servidor');

  // Se o servidor tiver um sistema de login, enviar o comando de login
  // O servidor pode exigir o login em formato específico, como:
  // bot.chat('/login 12345678') - Isso pode variar dependendo do servidor
  bot.chat('/login 12345678');  // Alterar conforme o formato de comando do servidor
  bot.chat('CHEGUEI RAPAZIADA!');  // Alterar conforme o formato de comando do servidor
});

// Função para bot dormir
let botSleeping = false;
let homeCoordinates = { x: 100, y: 64, z: 100 }; // Coordenadas específicas

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

// Função para o bot acordar e ir para as coordenadas
function botWakeUp() {
  if (!botSleeping) return;

  botSleeping = false;
  bot.chat("Estou acordando...");
  console.log("Bot acordou e agora está indo para as coordenadas.");

  bot.moveTo(homeCoordinates).then(() => {
    bot.chat("Cheguei no trabalho!");
    console.log("Bot chegou nas coordenadas.");
  }).catch((err) => {
    console.log("Erro ao mover para o ponto de descanso: ", err);
  });
}

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket para interação com o frontend
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

  // Enviar mensagens do bot para o frontend
  bot.on('chat', (username, message) => {
    socket.emit('botChat', `${username}: ${message}`);
  });
});

// Iniciar o servidor na porta 3000
const port = 3000;
server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
