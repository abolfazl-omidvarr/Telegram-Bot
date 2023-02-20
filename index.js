const { Telegraf } = require("telegraf");

const bot = new Telegraf("6144181414:AAH2isc8GPTSyQJM3nB7FwJkIWgCYyte14Q");
bot.start((ctx) => ctx.reply(".من یک بات بی‌خاصیت هستم"));

bot.start((ctx) =>
	ctx.reply(".سریع باش اگه میخوای زنده بمونی یک اسنیکر سمی بفرست")
);

bot.on("sticker", (ctx) => ctx.reply(".سمش کم بود 😢 ولی ایندفه کاریت ندارم"));

bot.launch();
