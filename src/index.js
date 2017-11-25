const Bot = require('./Bot');

const coin = 'BCC';

const bot = new Bot({
  apikey: '4990c711ecc34780a01a4f4b3eb4ac6d',
  apisecret: '3921c436da5b4572a6668a9ae55c0ac8',
});

(async () => {
  try {
    // const rsi = await bot.calculateRSI(coin, 14, 'fiveMin');
    const breakout = await bot.findBreakout(coin, 14, 'oneMin');
    // console.log('RSI:', coin, rsi);
    console.log('Breakout:', coin, breakout);
    // console.log(`BTC-${coin} Breakout:${breakout} - RSI: ${rsi}`);
  } catch (err) {
    console.log(err);
    return { success: false, message: err.message };
  }
})();
