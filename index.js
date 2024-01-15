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

const koronaData = {
	link: 'https://koronapay.com/transfers/online/api/transfers/tariffs?',
	params: {
		"sendingCountryId": "RUS",
		"sendingCurrencyId": "810",
		"receivingCountryId": "THA",
		"receivingBankCode": "025",
		"receivingCurrencyId": "840",
		"receivingAmount": "10000",
		"receivingMethod": "accountViaDeeMoney",
		"paidNotificationEnabled": "false",
		"paymentMethod": "debitCard"
	}
}

const getCryptoData = async () => {
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

const getKoronaData = async () => {
	let url = koronaData.link;
	Object.entries(koronaData.params).forEach(param => url += `${param[0]}=${param[1]}&`);

	const request = await fetch(url);
	return await request.json();
}

const start = () => {
	bot.setMyCommands([
		{command: '/info', description: 'Получить курс обмена'}
	]);
	
	bot.on('message', async msg => {
		const isVoice = msg.voice;
		const text = msg.text;
		const chatId = msg.chat.id;

		console.log(msg)
		//msg.from.id === 1345379438
	
		if (text === '/start') {
			return bot.sendMessage(chatId, 'Привет, поц');
		}
	
		if (text === '/info') {
			let answer;

			try {
				await bot.sendMessage(chatId, 'Щас узнаем');
				answer = '<b>Курс обмена Рубль-Бат</b>';

				//контент криптобирж
				const [rubData, thbData] = await getCryptoData();

				const rubRateCommext = rubData.data[0].adDetailResp.price;
				const thbRateBinance = thbData.data[0].adv.price;

				answer += '\n\nКоммекс - Бинанс: ';
				answer += rubRateCommext && thbRateBinance ? `1 бат от ${(rubRateCommext / thbRateBinance).toFixed(2)}` : 'Данных нет';

				//контент короны
				const [koronaData] = await getKoronaData();

				const rubAmountKorona = koronaData.exchangeRate * 100;
				const thbAmountKorona = koronaData.receivingAmountComment.replace(/\D/g, "");

				answer += '\n\nКорона: ';
				answer += rubAmountKorona && thbAmountKorona ? `1 бат за ${(rubAmountKorona / thbAmountKorona).toFixed(2)}` : 'Данных нет';
			} catch {
				answer = 'Чёт не то, попробуй позже';
			}

			return bot.sendMessage(chatId, answer, {parse_mode: 'HTML'});
		}

		if (isVoice) {
			return bot.sendMessage(chatId, 'Ты че ёбу дал?? Какие ещё голосовухи');
		}

		if (text && text.toLowerCase().search(/бала/i) !== -1) {
			return bot.sendMessage(chatId, 'Ээ ты чо, бала, рот твой шатал');
		}
	
		return bot.sendMessage(chatId, 'Не надо мне ничего писать, просто выбери команду');
	});
}

start();