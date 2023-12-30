const TelegramApi = require('node-telegram-bot-api');

const token = '6355764517:AAGSsWSTnqzsNY3G4UcysNCM2bd7W7DhOgg';

const bot = new TelegramApi(token, {polling: true});

const cryptoData = [
	{
		url: 'https://www.commex.com/bapi/c2c/v1/friendly/c2c/ad/search',
		body: {
			fiat: "RUB",
			asset: "USDT",
			page: 1,
			rows: 1,
			tradeType: "BUY"
		}
	},
	{
		url: 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
		body: {
			"fiat": "THB",
			"asset": "USDT",
			"page": 1,
			"rows": 1,
			"tradeType": "SELL"
		}
	}
];

const getData = async () => {
	const requests = cryptoData.map(item => fetch(item.url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify(item.body)
	}));

	const [r1, r2] = await Promise.all(requests);

	return [await r1.json(), await r2.json()];
}

const start = () => {
	bot.setMyCommands([
		{command: '/info', description: 'Получить курс обмена'}
	]);
	
	bot.on('message', async msg => {
		const text = msg.text;
		const chatId = msg.chat.id;
	
		if (text === '/start') {
			return bot.sendMessage(chatId, 'Привет, поц');
		}
	
		if (text === '/info') {
			let answer;

			try {
				const results = await getData();

				const rubRate = results[0].data[0].adDetailResp.price;
				const thbRate = results[1].data[0].adv.price;

				answer = `Курс обмена Рубль-Бат\n\nБинанс: 1 бат от ${(rubRate / thbRate).toFixed(2)}`;
			} catch {
				answer = 'Чёт не то, попробуй позже';
			}

			return bot.sendMessage(chatId, answer);
		}
	
		return bot.sendMessage(chatId, 'Не надо мне ничего писать, просто выбери команду');
	});
}

start();