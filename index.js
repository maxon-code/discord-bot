require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const COOLDOWN_MS = 5 * 60 * 1000;
const userCooldowns = new Map();

const messages = [
    (name) => `🚨 ${name} заехал в хату. Шконки заняты — занимайте места!`,
    (name) => `🔒 ${name} принял дозу в канале. Связь по рации, кипиш не поднимать!`,
    (name) => `🥷 В хате новый человек — ${name}. Авторитетно просим встречать!`,
    (name) => `🚔 ${name} прибыл в канал. Проверка камеры через пять минут!`,
    (name) => `🍵 ${name} зашёл в хату. Чай на общий стол, базар начинаем!`,
    (name) => `📢 Этап прибыл: ${name} теперь в канал. Всем сохранять спокойствие!`,
    (name) => `🔑 ${name} получил прописку в камеру. Камера пополнена!`,
    (name) => `🧱 ${name} зашёл в хату. Дверь закрыть, разговоры вести по очереди!`,
];

client.once("ready", () => {
    console.log(`Бот запущен: ${client.user.tag}`);
});

const SPECIAL_USER_ID = "1345440672244830292";

client.on("voiceStateUpdate", async (oldState, newState) => {

    if (oldState.channelId || !newState.channelId) return;

    const userId = newState.id;
    const now = Date.now();

    const cooldownUntil = userCooldowns.get(userId) ?? 0;
    if (now < cooldownUntil) return;

    const name = newState.member?.displayName ?? "Кто-то";
    const makeMessage =
        messages[Math.floor(Math.random() * messages.length)];

    const isSpecialUser = userId === SPECIAL_USER_ID;
    const everyone = isSpecialUser ? "@everyone " : "";

    try {
        const textChannel = await newState.guild.channels.fetch(
            "1556964020207091712"
        );

        if (!textChannel?.isTextBased()) {
            console.log("Канал уведомлений не найден или он не текстовый");
            return;
        }

        await textChannel.send({
            content: `${everyone}${makeMessage(name)}`,
            allowedMentions: {
                parse: isSpecialUser ? ["everyone"] : [],
            },
        });

        userCooldowns.set(userId, now + COOLDOWN_MS);
    } catch (error) {
        console.error("Не удалось отправить сообщение:", error);
    }
});
client.login(process.env.DISCORD_TOKEN);


