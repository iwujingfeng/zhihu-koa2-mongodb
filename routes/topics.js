const jwt = require("koa-jwt");
const Router = require("koa-router");
const router = new Router({ prefix: "/topics" });

const {
  find,
  findById,
  create,
  update,
  listTopicFollowers,
  checkTopicExist,
} = require("../controller/topics");

const { select } = require("../config");
const auth = jwt({ select });

router.get("/", find);
router.post("/", auth, create);
router.get("/:id", checkTopicExist, findById);
router.patch("/:id", auth, checkTopicExist, update);
// 获取话题粉丝
router.get("/:id/topicFollowers", checkTopicExist, listTopicFollowers);

module.exports = router;
