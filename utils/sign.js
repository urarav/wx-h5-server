const { APP_ID, APP_SECRET } = require("../config/index");
const instance = require("./request");
const { getRandomStr, getTimpstamp, parseObj } = require("./common");
const sha1 = require("sha1");
const db = require("../db/index");

async function getAccessToken() {
  const {
    data: { access_token },
  } = await instance.get(
    `/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`
  );
  return access_token;
}

async function getJsApiTicket() {
  const access_token = await getAccessToken();
  const {
    data: { ticket },
  } = await instance.get(
    `/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
  );
  return ticket;
}

function cache() {
  return new Promise((resolve, reject) => {
    db.query("select * from cache_table", async (err, results) => {
      if (err) reject(err);
      if (results.length) {
        const [{ ticket, ticket_time }] = results;
        if (Date.now() - ticket_time > 7000 * 1000) {
          const ticket = await getJsApiTicket();
          db.query(
            "update cache_table set ticket=?, ticket_time=? where ticket=?",
            [ticket, String(Date.now()), ticket],
            (err, results) => {
              if (err) reject(err);
              if (results.affectedRows === 1) resolve(ticket);
            }
          );
        } else {
          resolve(ticket);
        }
      } else {
        const ticket = await getJsApiTicket();
        db.query(
          "insert into cache_table set ?",
          {
            ticket,
            ticket_time: String(Date.now()),
          },
          (err, results) => {
            if (err) reject(err);
            if (results.affectedRows === 1) resolve(ticket);
          }
        );
      }
    });
  });
}

/**
 * 1）参与签名的字段包括noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分）
 * 2）对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后
 * 3）使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1。这里需要注意的是所有参数名均为小写字符
 * 4）对string1作sha1加密，字段名和字段值都采用原始值，不进行URL 转义
 */
async function sign(url) {
  const jsapi_ticket = await cache();
  const _url = decodeURIComponent(url);
  const obj = {
    noncestr: getRandomStr(),
    jsapi_ticket,
    timestamp: getTimpstamp(),
    url: _url,
  };
  const resultObj = {};
  const keys = Object.keys(obj);
  keys.sort();
  keys.forEach((key) => (resultObj[key.toLowerCase()] = String(obj[key])));
  const signature = sha1(parseObj(resultObj));
  resultObj.signature = signature;
  resultObj.appId = APP_ID;
  return resultObj;
}

module.exports = {
  getAccessToken,
  getJsApiTicket,
  sign,
};
