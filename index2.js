require("dotenv").config();

const { Configuration, OpenAIApi } = require("openai");
const LanguageDetect = require("languagedetect");
const { Telegraf } = require("telegraf");
const session = require("telegraf/session");

const config = new Configuration({
	apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(config);
const lngDetector = new LanguageDetect();
const bot = new Telegraf(process.env.TEL_KEY);

const runPromptText = async (msg) => {
	let data;

	try {
		const prompt = msg;
		const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: prompt,
			max_tokens: 1500,
			temperature: 1,
		});
		data = response.data;
	} catch (error) {
		console.log("some error hapened on gpt API : " + error);
		data = { choices: [{ text: "Slow down im thinking..." }] };
	}

	return data;
};

const runPromptImage = async (msg, ctx) => {
	try {
		const prompt = msg;
		const response = await openai.createImage({
			prompt: prompt,
			n: 1,
			size: "512x512",
		});
		return response.data.data[0].url;
	} catch (error) {
		console.log("some error hapened on gpt Image API : " + error);
		ctx.reply("somthing went wrong, maybe your request was inappropriate");
	}
};

bot.use(session());

bot.start((ctx) => {
	ctx.reply("hello dear visit /menu to see available options");
});

bot.command("menu", (ctx) => {
	bot.telegram.sendMessage(ctx.chat.id, "Algorithms available:", {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: "Text Completion",
						callback_data: "tc",
					},
					{ text: "Image Generation", callback_data: "ig" },
				],
			],
		},
	});
});

bot.action("tc", (ctx, next) => {
	ctx.deleteMessage();
	ctx.reply("Ok ask me anything you want dear");
	ctx.session.option = "tc";
	next(ctx);
});
bot.action("ig", (ctx, next) => {
	ctx.deleteMessage();
	ctx.reply("What picture do you want me to generate?");
	ctx.session.option = "ig";
	next(ctx);
});

bot.use((ctx, next) => {
	try {
		let userFirstName;
		let userID;
		if (ctx.message) {
			if (ctx.message.from) {
				userFirstName = ctx.message.from.first_name;
				userID = ctx.message.from.username;
			} else {
				userFirstName = "john Doe";
				userID = "@JohnDoe";
			}

			const msg = ctx.message.text;
			// const sticker = ctx.message.sticker && ctx.message.sticker.file_id;

			// bot.telegram.sendMessage(-892860476, `${userFirstName}:@${userID} sent:`);

			// if (msg) {
			// 	bot.telegram.sendMessage(-892860476, msg);
			// }

			// if (sticker) {
			// 	bot.telegram.sendSticker(-892860476, sticker);
			// }

			const detectedLanguages = lngDetector.detect(msg);

			try {
				if (
					["pashto", "farsi", "arabic", "urdu"].includes(
						detectedLanguages[0][0]
					)
				) {
					ctx.reply("I'm not very good at persian and Arabic");
				}
			} catch {
				console.error("language detection faild");
			}
			next(ctx);
		}
	} catch (error) {
		console.log("error happened in bot use middleware:" + error);
	}
});

bot.on("text", (ctx, next) => {
	if (!ctx.session.option) {
		ctx.reply("visit /menu to see available options");
	}
	// if(ctx.session.using){
	//     ctx.reply("still working on your last request. please wait");
	// }
	else {
		next(ctx);
	}
});

bot.on("text", (ctx, next) => {
	ctx.session.using = true;
	const query = ctx.update.message.text;
	if (ctx.session.option === "tc") {
		runPromptText(query)
			.then((data) => {
				const generatedtext = data.choices[0].text;
				bot.telegram.sendMessage(ctx.chat.id, generatedtext);
				botLogger(ctx.update.message, undefined, generatedtext);
				ctx.session.using = false;
			})
			.catch((err) => console.log("error in runPromptText : " + err));
	}
	if (ctx.session.option === "ig") {
		ctx.reply("Generating your picture...");
		runPromptImage(query, ctx)
			.then((url) => {
				console.log(url);
				bot.telegram.sendPhoto(ctx.chat.id, url);
				botLogger(ctx.update.message, url, undefined);
				ctx.session.using = false;
			})
			.catch((err) => console.log("error in runPromptImage : " + err));
	}
	next(ctx);
});

const botLogger = async (userData, photoUrl, text) => {
	let userFirstName;
	let userID;

	if (userData.from) {
		userFirstName = userData.from.first_name;
		userID = userData.from.username;
	} else {
		userFirstName = "john Doe";
		userID = "@JohnDoe";
	}
	bot.telegram.sendMessage(
		-1001860542369,
		`${userFirstName}:@${userID} sent:\n\n\n${userData.text}`
	);
	setTimeout(function () {
		if (photoUrl) {
			bot.telegram.sendPhoto(-1001860542369, photoUrl);
		}
		if (text) {
			bot.telegram.sendMessage(-1001860542369, text);
		}
	}, 150);
};

// bot.on("sticker", (ctx) => {
// 	console.log("sticker sent");
// });

// bot.on("text", (ctx) => {
// 	try {
// 		bot.telegram.sendChatAction(ctx.chat.id, "typing");

// 		const msg = ctx.message.text;

// 		runPrompt(msg)
// 			.then((data) => {
// 				console.log(data);
// 				// ctx.reply(data.choices[0].text + "image geneterated as follows: ");
// 				ctx.replyWithPhoto(data);
// 				// telegram.sendPhoto(-892860476, photo, [extra])
// 				// bot.telegram.sendMessage(-892860476, data.choices[0].text);
// 			})
// 			.catch((err) => {
// 				console.log("s.th happened on runPrompt promise : " + err);
// 			});
// 	} catch (error) {
// 		console.log("s.th happende on bot on middleware" + error);
// 	}
// });

// bot.on("sticker", (ctx) => ctx.reply("what should i do with this?"));

bot.launch();
