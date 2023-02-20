const { Telegraf } = require('telegraf');

const bot = new Telegraf("6144181414:AAH2isc8GPTSyQJM3nB7FwJkIWgCYyte14Q");
bot.start((ctx) => ctx.reply('هاله اهل قبرس است :)))))))))))))\n حالا یدونه استیکر بفرست'));
bot.on('sticker', (ctx) => ctx.reply(' بیلاخ 👍 \n :)))))))))))))))))))))))))))))))))))))))'));
bot.launch();
