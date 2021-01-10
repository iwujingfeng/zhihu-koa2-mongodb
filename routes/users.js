const jwt = require("koa-jwt");
const { secret } = require("../config");
const Router = require("koa-router");
// 路由前缀
const router = new Router({ prefix: "/users" });
const {
  find,
  findById,
  create,
  update,
  del,
  login,
  checkOwner,
  listFollowing,
  listFollowers,
  follow,
  unfollow,
  checkUserExist,
  followTopic,
  unfollowTopic,
  listFollowingTopics,
} = require("../controller/users");

const { checkTopicExist } = require("../controller/topics");

// 用户验证中间件
const auth = jwt({ secret });

router.get("/", find);

router.post("/", create);

router.get("/:id", findById);

router.patch("/:id", auth, checkOwner, update);

router.delete("/:id", auth, checkOwner, del);

// 登录路由
router.post("/login", login);

// 关注列表
router.get("/:id/following", listFollowing);
// 粉丝列表
router.get("/:id/followers", listFollowers);
// 关注某人 :id是关注的人的ID
router.put("/following/:id", auth, checkUserExist, follow);
// 取消关注
router.delete("/following/:id", auth, checkUserExist, unfollow);
// 关注话题 :id是关注的话题的ID
router.put("/followingTopics/:id", auth, checkTopicExist, followTopic);
// 取消关注话题
router.delete("/followingTopics/:id", auth, checkTopicExist, unfollowTopic);
// 关注的话题列表
router.get("/:id/followingTopic", listFollowingTopics);

module.exports = router;
