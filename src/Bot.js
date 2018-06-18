const _ = require('lodash');
const crypto = require('crypto');
const { URL } = require('url');
const querystring = require('querystring');
const axios = require('axios');

class Bot {
  constructor({ uri = 'https://bittrex.com', apikey = '', apisecret = '' }) {
    this.key = apikey;
    this.secret = apisecret;
    this.uri = new URL(uri);
    return this;
  }

  sign(uri) {
    return crypto
      .createHmac('sha512', this.secret)
      .update(uri)
      .digest('hex');
  }

  async request(options) {
    let uri = this.uri.toString();
    if (options) {
      const q = querystring.stringify(options);
      uri += `?${q}`;
    }

    const { data } = await axios.get(uri, {
      headers: { apisign: this.sign(uri) },
      responseType: 'json',
    });
    return data;
  }

  async getBalance(currency = 'btc') {
    this.uri.pathname = '/api/v1.1/account/getbalance';
    const options = {
      currency,
      apikey: this.key,
      nonce: new Date().getTime(),
    };
    return this.request(options);
  }

  // Used to place a buy order in a specific market.
  async buy({ coin, quantity, rate }) {
    this.uri.pathname = '/api/v1.1/market/buylimit';
    const options = {
      market: `BTC-${coin}`,
      quantity,
      rate,
    };
    return this.request(options);
  }

  // Used to place an sell order in a specific market
  async sell({ coin, quantity, rate }) {
    this.uri.pathname = '/api/v1.1/market/selllimit';
    const options = {
      market: `BTC-${coin}`,
      quantity,
      rate,
    };
    return this.request(options);
  }

  async cancel(uuid) {
    this.uri.pathname = '/api/v1.1/market/cancel';
    const options = {
      uuid,
      apikey: this.key,
    };
    return this.request(options);
  }

  async getMarketSummary(currency = 'eth') {
    this.uri.pathname = '/api/v1.1/public/getmarketsummary';
    const market = `btc-${currency}`;
    return this.request({ market });
  }

  async getOrderBook(currency = 'ETH', type = 'both') {
    this.uri.pathname = '/api/v1.1/public/getorderbook';
    const options = {
      market: `BTC-${currency}`,
      type,
    };
    return this.request(options);
  }

  async getOpenOrders(currency = 'ETH') {
    this.uri.pathname = '/api/v1.1/market/getopenorders';
    const options = {
      market: `BTC-${currency}`,
      apikey: this.key,
      nonce: new Date().getTime(),
    };
    return this.request(options);
  }

  // The following method was borrowed from https://github.com/rmullin7286/BittrexBot/blob/master/BittrexBot/bittrex.py#L58
  // The original bittrx API did not support v2 of the api which returns historical data
  // Credit where it's due :)
  // returns the historical data in the form of a JSON file
  // period is the number of units to be analyzed
  // valid values for periods are 'oneMin', 'fiveMin', 'thirtyMin', 'hour', 'week', 'day', and 'month'
  // unit is the number of periods to be returned
  async getTicks(currency, unit) {
    this.uri.pathname = '/api/v2.0//pub/market/GetTicks';
    const options = {
      marketName: `BTC-${currency}`,
      tickInterval: unit,
    };
    return this.request(options);
  }

  // Returns closing prices within a specified time frame for a coin pair
  async getClosingPrices(currency = 'ETH', period = 5, unit = 'thirtyMin') {
    const ticks = await this.getTicks(currency, unit);
    const { result = [] } = ticks;
    return _.takeRight(result, period).map(e => e.C);
  }

  // Returns the Simple Moving Average for a coin pair
  async calculateSMA(currency = 'ETH', period = 5, unit = 'hour') {
    const closing = await this.getClosingPrices(currency, period, unit);
    const totalClosing = closing.length > 0 ? closing.reduce((total, x) => total + x) : 0;
    return totalClosing / period;
  }

  // Returns the Exponential Moving Average for a coin pair
  async calculateEMA(currency = 'ETH', period = 5, unit = 'hour') {
    const closingPrices = await this.getClosingPrices(currency, period, unit);
    const previousEMA = await this.calculateSMA(currency, period, unit);
    const c = 2 / (period + 1);
    return closingPrices[-1] * c + previousEMA * (1 - c);
  }

  async calculateRSI(currency = 'ETH', period = 5, unit = 'hour') {
    // Calculates the Relative Strength Index for a coin_pair
    // If the returned value is above 70, it's overbought (SELL IT!)
    // If the returned value is below 30, it's oversold (BUY IT!)

    try {
      const closingPrices = await this.getClosingPrices(currency, period * 3, unit);

      let count = 0;
      const change = [];

      // Calculating price changes
      for (const i of closingPrices) {
        if (count !== 0) {
          change.push(i - closingPrices[count - 1]);
        }
        count += 1;
        if (count === 15) {
          break;
        }
      }

      // Calculating gains and losses
      const advances = change.filter(c => c > 0);
      const declines = change.filter(c => c < 0).map(c => Math.abs(c));

      const averageGain = advances.length > 0 ? advances.reduce((total, x) => total + x) / 14 : 0;
      const averageLoss = declines.length > 0 ? declines.reduce((total, x) => total + x) / 14 : 0;
      let newAvgGain = averageGain;
      let newAvgLoss = averageLoss;
      for (const i of closingPrices) {
        if (count > 14 && count < closingPrices.length) {
          const close = closingPrices[count];
          const newChange = close - closingPrices[count - 1];
          let addLoss = 0;
          let addGain = 0;
          if (newChange > 0) addGain = newChange;
          if (newChange < 0) {
            addLoss = Math.abs(newChange);
            newAvgGain = (newAvgGain * 13 + addGain) / 14;
            newAvgLoss = (newAvgLoss * 13 + addLoss) / 14;
            count += 1;
          }
        }
      }

      const rs = newAvgGain / newAvgLoss;
      const newRS = 100 - 100 / (1 + rs);
      return newRS;
    } catch (err) {
      throw err;
    }
  }

  async calculateBaseLine(currency = 'ETH', unit = 'hour') {
    // Calculates (26 period high + 26 period low) / 2
    // Also known as the "Kijun-sen" line

    const closingPrices = await this.getClosingPrices(currency, 26, unit);
    const periodHigh = _.max(closingPrices) || 0;
    const periodLow = _.min(closingPrices) || 0;
    return (periodHigh + periodLow) / 2;
  }

  async calculateConversionLine(currency = 'ETH', unit = 'hour') {
    // Calculates (9 period high + 9 period low) / 2
    // Also known as the "Tenkan-sen" line

    const closingPrices = await this.getClosingPrices(currency, 9, unit);
    const periodHigh = _.max(closingPrices) || 0;
    const periodLow = _.min(closingPrices) || 0;
    return (periodHigh + periodLow) / 2;
  }

  async calculateLeadingSpanA(currency = 'ETH', unit = 'hour') {
    // Calculates (Conversion Line + Base Line) / 2
    // Also known as the "Senkou Span A" line

    const baseLine = await this.calculateBaseLine(currency, unit);
    const conversionLine = await this.calculateConversionLine(currency, unit);
    return (baseLine + conversionLine) / 2;
  }

  async calculateLeadingSpanB(currency = 'ETH', unit = 'hour') {
    // Calculates (52 period high + 52 period low) / 2
    // Also known as the "Senkou Span B" line

    const closingPrices = await this.getClosingPrices(currency, 52, unit);
    const periodHigh = _.max(closingPrices) || 0;
    const periodLow = _.min(closingPrices) || 0;
    return (periodHigh + periodLow) / 2;
  }

  async findBreakout(currency = 'ETH', period = 5, unit = 'hour') {
    // Finds breakout based on how close the High was to Closing and Low to Opening

    let hit = 0;
    const historical_data = await this.getTicks(currency, unit);
    const sample = _.takeRight(historical_data, period);
    for (const i of sample) {
      if (i.C === i.H && i.O === i.L) hit += 1;
    }
    return hit / period >= 0.75;
  }
}

module.exports = Bot;
