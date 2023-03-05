function getRandomStr() {
  return Math.random().toString(36).slice(2);
}

function getTimpstamp() {
  return Date.now().toString();
}

function parseObj(sourceObj) {
  return Object.entries(sourceObj)
    .map((entry) => entry.join("="))
    .join("&");
}

module.exports = {
  getRandomStr,
  getTimpstamp,
  parseObj,
};
