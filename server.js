const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: process.env.MINECRAFT_SERVER,
  port: 25565,
  username: process.env.BOT_NAME,
  password: process.env.BOT_PASSWORD,
});

let botSleeping = false;
let homeCoordinates = { x: 100, y: 64, z: 100 }; // Coordenadas para o bot voltar após dormir

// Função para bot dormir na cama
function botSleep() {
  if (botSleeping) return;

  botSleeping = true;
  bot.chat("Vou dormir agora...");
  console.log("Bot está indo dormir...");

  // Procurando uma cama perto do bot
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

// Função para o bot acordar e voltar para coordenadas específicas
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

// Comando no chat
bot.on('chat', (username, message) => {
  if (message === 'dormir' && !botSleeping) {
    botSleep();
  }

  if (message === 'acordar' && botSleeping) {
    botWakeUp();
  }

  // Outros comandos podem ser adicionados aqui
});

// Bot logando e se conectando ao servidor
bot.on('spawn', () => {
  console.log(`${bot.username} está online no servidor!`);
});
