require('dotenv').config();

const Bot = require('./Bot');

const coin = 'BCC';

const bot = new Bot({
  apikey: process.env.API_KEY,
  apisecret: process.env.API_SECRET,
});

(async () => {
  try {
    const rsi = await bot.calculateRSI(coin, 14, 'fiveMin');
    const breakout = await bot.findBreakout(coin, 14, 'oneMin');
    console.log(`BTC-${coin} Breakout:${breakout} - RSI: ${rsi}`);
    return;
  } catch (err) {
    console.log(err);
    return { success: false, message: err.message };
  }
})();
