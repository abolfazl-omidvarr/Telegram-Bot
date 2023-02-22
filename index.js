require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
	apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(config);
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TEL_KE);




const runPrompt = async () => {
	const prompt =
		"write a python code that adds two random number and prints the result";
	const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt: prompt,
		max_tokens: 2048,
		temperature: 1,
	});
	console.log(response.data);
};




bot.start((ctx) => {
	ctx.reply(
		"سلام من اصلا یک کاپی از ChatGPT نیستم. می‌تونی هر چه دل تنگت می‌خواهد ازم بپرسی."
	);
});

bot.on("message", (ctx) => {
	runPrompt();
});
bot.on("sticker", (ctx) =>
	ctx.reply("استیکر عنه؟ یه متنی چیزی بفرست جوابت و بدم گلابی")
);

bot.launch();
