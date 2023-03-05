const express = require("express");
const router = express.Router();

const sha1 = require("sha1");
const { TOKEN } = require("../config/index");
const { sign } = require("../utils/sign");

/**
 * 若确认此次GET请求来自微信服务器，请原样返回echostr参数内容，则接入生效，成为开发者成功，否则接入失败。加密/校验流程如下：
 * 1）将token、timestamp、nonce三个参数进行字典序排序
 * 2）将三个参数字符串拼接成一个字符串进行sha1加密
 * 3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
 */
router.get("/auth", (req, res, next) => {
  const {
    query: { signature, timestamp, nonce, echostr },
  } = req;
  const arr = Array.of(TOKEN, timestamp, nonce);
  arr.sort();
  if (Object.is(sha1(arr.join("")), signature)) {
    res.set("Content-Type", "text/plain");
    res.send(echostr);
  } else {
    res.send("error occurred in auth");
  }
});

router.get("/jsapi", async (req, res) => {
  const {
    query: { url },
  } = req;
  const config = await sign(url);
  res.send(config);
});

module.exports = router;
