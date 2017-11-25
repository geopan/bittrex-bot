const { expect, should } = require('chai');

describe('Bot', () => {
  describe('#constructor', () => {
    it('should construct a new Bot');
  });
  describe('#sign', () => {
    it('should sign a uri for bittrex');
  });
  describe('#request', () => {
    it('should fetch data from bittrex');
  });
  describe('#getBalance', () => {
    it('should return own balance');
  });
  describe('#buy', () => {
    it('should buy');
  });
  describe('#getMarketSummary', () => {
    it('should return market summary from bittrex');
  });
  describe('#getOrderBook', () => {
    it('should return order book from bittrex');
  });
  describe('#request', () => {
    it('should fetch data from bittrex');
  });
  describe('#getTicks', () => {
    it('should fetch ticks from bittrex');
  });
  describe('#getClosingPrices', () => {
    it('should return closing prices');
  });
  describe('#calculateSMA', () => {
    it('should return SMA');
  });
  describe('#calculateEMA', () => {
    it('should return EMA');
  });
  describe('#calculateRSI', () => {
    it('should return RSI');
  });
  describe('#calculateBaseLine', () => {
    it('should return base line');
  });
  describe('#calculateConversionLine', () => {
    it('should return conversion line');
  });
  describe('#calculateLeadingSpanA', () => {
    it('should return leading Span A');
  });
  describe('#calculateLeadingSpanB', () => {
    it('should return leading Span B');
  });
  describe('#findBreakout', () => {
    it('should return true or false');
  });
});
