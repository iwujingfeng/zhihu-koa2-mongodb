const Koa = require("koa");
// const bodyParser = require("koa-bodyparser");
const cors = require('koa2-cors')
const koaBody = require("koa-body");
const koaStatic = require("koa-static");
const path = require("path");
const error = require("koa-json-error");
const parameter = require("koa-parameter");
const mongoose = require("mongoose");
const { mongodbUrl } = require("./config");
const app = new Koa();
app.use(cors()); // 解决跨域
// 导入批量处理routes的index.js
const routing = require("./routes");

// 连接数据库
mongoose.connect(mongodbUrl, { useNewUrlParser: true }, () =>
  console.log("mongodb连接成功")
);
mongoose.connection.on("error", console.error);

app.use(koaStatic(path.join(__dirname, "public")));

// 错误处理中间件
app.use(
  error({
    postFormat: (err, { stack, ...rest }) =>
      process.env.NODE_ENV === "production" ? rest : { stack, ...rest },
  })
);

// app.use(bodyParser());
app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, "/public/uploads"),
      keepExtensions: true,
    },
  })
);
app.use(parameter(app));
routing(app); // 必须放在app.use后面 不然无法解析body
app.listen(3000, () => console.log("程序已启动 端口3000"));
