require('dotenv').config();
const { expect, should } = require('chai');
const Bot = require('./Bot');

let bot;

describe('Bot', function () {
  this.timeout(5000);
  before(() => {
    bot = new Bot({
      apikey: process.env.API_KEY,
      apisecret: process.env.API_SECRET,
    });
    expect(bot).to.exist;
  });
  describe('#sign', () => {
    it('should sign a uri for bittrex', () => {
      const sign = bot.sign('https://bittrex.com');
      expect(sign).to.be.a('string').not.empty;
    });
  });
  describe('#request', () => {
    it('should fetch data from bittrex', async () => {
      const market = 'BTC-ETC';
      bot.uri.pathname = '/api/v1.1/public/getmarketsummary';
      const res = await bot.request({ market });
      expect(res).to.haveOwnProperty('success', true);
    });
  });
  describe('#getBalance', () => {
    it('should return own balance', async () => {
      const res = await bot.getBalance();
      expect(res).to.haveOwnProperty('success', true);
    });
  });
  describe('#buy', () => {
    it('should buy');
  });
  describe('#getMarketSummary', () => {
    it('should return market summary from bittrex', async () => {
      const res = await bot.getMarketSummary();
      expect(res).to.haveOwnProperty('success', true);
    });
  });
  describe('#getOrderBook', () => {
    it('should return order book from bittrex', async () => {
      const res = await bot.getOrderBook();
      expect(res).to.haveOwnProperty('success', true);
    });
  });
  describe('#getTicks', () => {
    it('should fetch ticks from bittrex', async () => {
      const res = await bot.getTicks('ETH', 'hour');
      expect(res).to.haveOwnProperty('success', true);
    });
  });
  describe('#getClosingPrices', () => {
    it('should return closing prices', async () => {
      const res = await bot.getClosingPrices();
      expect(res).to.be.an('array').not.empty;
    });
  });
  describe('#calculateSMA', () => {
    it('should return SMA', async () => {
      const res = await bot.calculateSMA();
      expect(res).to.be.a('number');
    });
  });
  describe('#calculateEMA', () => {
    it('should return EMA', async () => {
      const res = await bot.calculateEMA();
      expect(res).to.be.a('number');
    });
  });
  describe('#calculateRSI', () => {
    it('should return RSI', async () => {
      const res = await bot.calculateRSI();
      expect(res).to.be.a('number');
    });
  });
  describe('#calculateBaseLine', () => {
    it('should return base line', async () => {
      const res = await bot.calculateBaseLine();
      expect(res).to.be.a('number');
    });
  });
  describe('#calculateConversionLine', () => {
    it('should return conversion line', async () => {
      const res = await bot.calculateConversionLine();
      expect(res).to.be.a('number');
    });
  });
  describe('#calculateLeadingSpanA', () => {
    it('should return leading Span A', async () => {
      const res = await bot.calculateLeadingSpanA();
      expect(res).to.be.a('number');
    });
  });
  describe('#calculateLeadingSpanB', () => {
    it('should return leading Span B', async () => {
      const res = await bot.calculateLeadingSpanB();
      expect(res).to.be.a('number');
    });
  });
  describe('#findBreakout', () => {
    it('should return true or false', async () => {
      const res = await bot.findBreakout();
      expect(res).to.be.a('boolean');
    });
  });
});
