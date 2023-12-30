const TelegramApi = require('node-telegram-bot-api');

const token = '6355764517:AAGSsWSTnqzsNY3G4UcysNCM2bd7W7DhOgg';

const bot = new TelegramApi(token, {polling: true});

const start = () => {
	bot.setMyCommands([
		{command: '/info', description: 'Получить курс обмена'}
	]);
	
	bot.on('message', msg => {
		const text = msg.text;
		const chatId = msg.chat.id;
	
		if (text === '/start') {
			return bot.sendMessage(chatId, 'Привет поц');
		}
	
		if (text === '/info') {
			return bot.sendMessage(chatId, 'Скоро здесь будет курс обмена');
		}
	
		return bot.sendMessage(chatId, 'Не надо мне ничего писать, просто выбери команду');
	});
}

start();