const axios = require("axios");
const { TIMEOUT, BASE_URL } = require("../config/index");

class Request {
  constructor(baseURL, timeout) {
    this.instance = axios.create({
      baseURL,
      timeout,
    });
  }
  request(config) {
    return this.instance.request(config);
  }
  get(url, config) {
    return this.instance.get(url, config);
  }
  post(url, data, config) {
    return this.instance.post(url, data, config);
  }
}
module.exports = new Request(BASE_URL, TIMEOUT);
