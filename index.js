const TelegramApi = require('node-telegram-bot-api');

const token = '6355764517:AAGSsWSTnqzsNY3G4UcysNCM2bd7W7DhOgg';

const bot = new TelegramApi(token, {polling: true});

const cryptoData = [
	{
		url: 'https://api2.bybit.com/fiat/otc/item/online',
		body: {
			amount: "",
			authMaker: false,
			canTrade: false,
			currencyId: "RUB",
			page: "1",
			payment: ["581"],
			side: "1",
			size: "2",
			tokenId: "USDT",
			userId: ""
		},
		name: 'bybit',
		p2pUrl: 'https://www.bybit.com/fiat/trade/otc/?actionType=1&token=USDT&fiat=RUB&paymentMethod=581'
	},
	{
		url: 'https://api-app.qq-os.com/api/c2c/v1/advert/list?type=1&fiat=RUB&asset=USDT&amount=&hidePaymentInfo=&payMethodId=110',
		name: 'bingx',
		p2pUrl: 'https://bingx.paycat.com/ru-ru/trade/self-selection?fiat=RUB&type=1'
	},
	{
		url: 'https://www.kucoin.com/_api/otc/ad/list?status=PUTUP&currency=USDT&legal=RUB&page=1&pageSize=10&side=SELL&amount=&payTypeCodes=&lang=ru_RU',
		name: 'kucoin',
		p2pUrl: 'https://www.kucoin.com/ru/otc/buy/USDT-RUB'
	},
	{
		url: 'https://p2p.mexc.com/api/market?allowTrade=false&amount=&blockTrade=false&coinId=128f589271cb4951b03e71e6323eb7be&countryCode=&currency=RUB&follow=false&haveTrade=false&page=1&payMethod=13&tradeType=SELL',
		name: 'mexc',
		p2pUrl: 'https://otc.mexc.com/ru-RU'
	},
	{
		url: 'https://www.bitget.com/v1/p2p/pub/adv/queryAdvList',
		body: {
			coinCode: "USDT",
			fiatCode: "RUB",
			languageType: 6,
			pageNo: 1,
			pageSize: 10,
			paymethodId: "229",
			side: 1
		},
		name: 'bitget',
		p2pUrl: 'https://www.bitget.com/ru/p2p-trade?fiatName=RUB'
	},
	{
		url: 'https://bitpapa.com/api/v1/pro/search?type=sell&page=1&sort=price&currency_code=RUB&previous_currency_code=RUB&crypto_currency_code=USDT&with_correct_limits=false&limit=20&pages=0&total=0&payment_method_bank_code=B3',
		name: 'bitpapa',
		p2pUrl: 'https://bitpapa.com/buy-usdt-with-tinkoff'
	},
	{
		url: 'https://www.gate.io/json_svr/query_push/?u=21&c=218334',
		body: {
			type: 'push_order_list',
			symbol: 'USDT_RUB',
			big_trade: 0,
			fiat_amount: '',
			amount: '',
			pay_type: 'tink',
			is_blue: 0,
			is_follow: 0,
			have_traded: 0,
		},
		name: 'gate',
		p2pUrl: 'https://www.gate.io/ru/c2c/market'
	},
	{
		url: 'https://www.htx.com/-/x/otc/v1/data/trade-market?coinId=2&currency=11&tradeType=sell&currPage=1&payMethod=28&acceptOrder=0&country=&blockType=general&online=1&range=0&amount=&isThumbsUp=false&isMerchant=false&isTraded=false&onlyTradable=false&isFollowed=false',
		name: 'htx',
		p2pUrl: 'https://www.htx.com/en-us/fiat-crypto/trade/buy-usdt-rub/'
	}
	// {
	// 	url: 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
	// 	body: {
	// 		"fiat": "THB",
	// 		"asset": "USDT",
	// 		"page": 1,
	// 		"rows": 1,
	// 		"tradeType": "SELL"
	// 	},
	// 	name: 'binance'
	// }
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
	const requests = cryptoData.map(item => {
		return fetch(item.url, item.body && {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify(item.body)
		});
	});

	const responces = await Promise.allSettled(requests);

	const results = [];

	for (let i = 0; i < responces.length; i++) {
		try {
			const res = await responces[i].value.json();
			results.push({
				name: cryptoData[i].name,
				rate: getPrice(res, cryptoData[i].name),
				p2p: `<a href="${cryptoData[i].p2pUrl}">p2p</a>`
			});
		} catch {
			results.push({
				name: cryptoData[i].name,
				rate: 'Нет данных',
				p2p: `<a href="${cryptoData[i].p2pUrl}">p2p</a>`
			});
		}
	}

	return results;
}

const getPrice = (data, name) => {
	switch (name) {
		case 'bybit': return data.result.items[0].price;
		case 'kucoin': return data.items[0].floatPrice;
		case 'mexc': return data.data[0].price;
		case 'bitget': return data.data.dataList[0].price;
		case 'bitpapa': return data.ads[0].price;
		case 'htx': return data.data[0].price;
		case 'gate':
		default: return 'Нет данных';
	}
}

const getKoronaData = async () => {
	let url = koronaData.link;
	Object.entries(koronaData.params).forEach(param => url += `${param[0]}=${param[1]}&`);

	const request = await fetch(url);
	return await request.json();
}

const start = () => {
	bot.setMyCommands([
		{command: '/buy_usdt', description: 'Курс покупки USDT'},
		{command: '/find_out_binance_rate', description: 'Ввести курс типков с бинанса'}
	]);
	
	bot.on('message', async msg => {
		const isVoice = msg.voice;
		const text = msg.text;
		const chatId = msg.chat.id;
	
		if (text === '/start') {
			return bot.sendMessage(chatId, 'Привет, поц');
		}
	
		if (text === '/buy_usdt') {
			let answer;
			let message_id;

			try {
				const message = await bot.sendMessage(chatId, 'Щас узнаем');
				message_id = message.message_id;
				answer = '<b>Курс покупки USDT</b>';

				//контент криптобирж
				const results = await getCryptoData();

				results.forEach(item => {
					const rub = !item.rate.toString().search(/Нет данных/) !== -1 && '₽';
					if (item.rate.toString().search(/Нет данных/) !== -1) {
						return answer += `\n\n${item.name}: ${item.rate} (${item.p2p})`;
					}
					return answer += `\n\n${item.name}: ${item.rate}${rub} (${item.p2p})`;
				});
			} catch {
				answer = 'Чёт не то, попробуй позже';
			} finally {
				bot.deleteMessage(chatId, message_id);
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

				// answer += '\n\nКоммекс - Бинанс: ';
				// answer += rubRateCommext && thbRateBinance ? `1 бат от ${(rubRateCommext / thbRateBinance).toFixed(2)}` : 'Данных нет';

				// //контент короны
				// const [koronaData] = await getKoronaData();

				// const rubAmountKorona = koronaData.exchangeRate * 100;
				// const thbAmountKorona = koronaData.receivingAmountComment.replace(/\D/g, "");

				// answer += '\n\nКорона: ';
				// answer += rubAmountKorona && thbAmountKorona ? `1 бат за ${(rubAmountKorona / thbAmountKorona).toFixed(2)}` : 'Данных нет';