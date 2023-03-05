const mysql = require("mysql");

const db = mysql.createPool({
  host: "127.0.0.1", // 数据库的IP地址
  port: "3306", // 数据库的端口号
  user: "root", // 登录数据库的账号
  password: "root", // 登录数据库的密码
  database: "wxdb", // 指定要操作哪个数据库
});

module.exports = db;
