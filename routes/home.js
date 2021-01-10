const Router = require("koa-router");
const router = new Router();
// 引入控制器的方法
const { index, upload } = require("../controller/home");

router.get("/", index);
router.post("/upload", upload);

module.exports = router;
