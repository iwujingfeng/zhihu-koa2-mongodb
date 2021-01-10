const TopicsModel = require("../model/topics");
const UserModel = require("../model/users");
class TopicsController {
  async find(ctx) {
    // 实现分页逻辑
    // limit(10).skip(10) 跳过第一页的10项 返回第二页的10项
    const { size = 10 } = ctx.query; // 不传size 默认10个数据
    const page = Math.max(ctx.query.page * 1, 1) - 1; // 查2页 跳过1页
    const _size = Math.max(size * 1, 1); // 参数传递的数量小于1 返回1
    ctx.body = await TopicsModel.find({ name: new RegExp(ctx.query.q) }) // 模糊搜索
      .limit(_size)
      .skip(page * _size);
  }

  // 检查话题是否存在的中间件
  async checkTopicExist(ctx, next) {
    const topic = await TopicsModel.findById(ctx.params.id);
    if (!topic) {
      ctx.throw(404, "话题不存在");
    }
    await next();
  }

  async findById(ctx) {
    const { fields = "" } = ctx.query;
    const selectFields = fields
      .split(";")
      .filter((f) => f)
      .map((f) => " +" + f)
      .join("");
    // 把列表过滤掉的字段加到返回的详情中
    const topic = await TopicsModel.findById(ctx.params.id).select(
      selectFields
    );
    ctx.body = topic;
  }
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false },
    });
    const topic = await new TopicsModel(ctx.request.body).save();
    ctx.body = topic;
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false },
    });
    const topic = await TopicsModel.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body
    );
    ctx.body = topic;
  }

  // 话题粉丝列表
  async listTopicFollowers(ctx) {
    // 查询所有用户 但是用户的following数组字段中必须包含当前用户的ID
    const users = await UserModel.find({ followingTopics: ctx.params.id });
    ctx.body = users;
  }
}

module.exports = new TopicsController();
