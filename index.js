require("dotenv").config();

const { Configuration, OpenAIApi } = require("openai");
const LanguageDetect = require("languagedetect");
const { Telegraf } = require("telegraf");

const config = new Configuration({
	apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(config);
const lngDetector = new LanguageDetect();
const bot = new Telegraf(process.env.TEL_KEY);

const runPrompt = async (msg) => {
	let data;

	try {
		const prompt = msg;
		const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: prompt,
			max_tokens: 2000,
			temperature: 1,
		});
		data = response.data;
	} catch (error) {
		console.log("some error hapened on gpt API : " + error);
		data = { choices: [{ text: "Slow down im thinking..." }] };
	}

	return data;
};

const greeting = "hello dear, ask me anything you want ";

bot.start((ctx) => {
	ctx.reply(greeting);
});

bot.use((ctx, next) => {
	try {
		let userFirstName;
		let userID;

		if (ctx.message.from) {
			userFirstName = ctx.message.from.first_name;
			userID = ctx.message.from.username;
		} else {
			userFirstName = "john Doe";
			userID = "@JohnDoe";
		}

		const msg = ctx.message.text;
		const sticker = ctx.message.sticker && ctx.message.sticker.file_id;

		bot.telegram.sendMessage(-892860476, `${userFirstName}:@${userID} sent:`);

		if (msg) {
			bot.telegram.sendMessage(-892860476, msg);
		}

		if (sticker) {
			bot.telegram.sendSticker(-892860476, sticker);
		}

		const detectedLanguages = lngDetector.detect(msg);

		try {
			if (
				["pashto", "farsi", "arabic", "urdu"].includes(detectedLanguages[0][0])
			) {
				ctx.reply("I'm not very good at persian and english");
			}
		} catch {
			console.error("language detection faild");
		}
		next(ctx);
	} catch (error) {
		console.log("error happened in bot use middleware:" + error);
	}
});

bot.on("text", (ctx) => {
	try {
		bot.telegram.sendChatAction(ctx.chat.id, "typing");

		const msg = ctx.message.text;

		runPrompt(msg)
			.then((data) => {
				ctx.reply(data.choices[0].text);
				bot.telegram.sendMessage(-892860476, data.choices[0].text);
			})
			.catch((err) => {
				console.log("s.th happened on runPrompt promise : " + err);
			});
	} catch (error) {
		console.log("s.th happende on bot on middleware" + error);
	}
});

bot.on("sticker", (ctx) => ctx.reply("what should i do with this?"));

bot.launch();
