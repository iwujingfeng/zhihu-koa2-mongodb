const jsonwebtoken = require("jsonwebtoken");
const { secret } = require("../config");
const UserModel = require("../model/users");

class UsersController {
  // 检查是否是用户自己 token是自己 但ID是别人的情况
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, "没有权限");
    }
    await next();
  }

  // 查询列表
  async find(ctx) {
    // 实现分页逻辑
    // limit(10).skip(10) 跳过第一页的10项 返回第二页的10项
    const { size = 10 } = ctx.query; // 不传size 默认10个数据
    const page = Math.max(ctx.query.page * 1, 1) - 1; // 查2页 跳过1页
    const _size = Math.max(size * 1, 1); // 参数传递的数量小于1 返回1
    const rows = await UserModel.find({ name: new RegExp(ctx.query.q) })
      .limit(_size)
      .skip(page * _size);
    ctx.body = {
      data: {
        code: 0,
        rows: rows,
      },
    };
  }
  // 查询特定用户
  async findById(ctx) {
    const { fields = "" } = ctx.query;
    const selectedFields = fields
      .split(";")
      .filter((f) => f)
      .map((f) => " +" + f)
      .join("");
    // TODO 话题引用 2、过滤引用话题的字段
    const populateStr = fields
      .split(";")
      .filter((f) => f)
      .map((f) => {
        if (f === "employments") {
          return "employments.company employments.job";
        }
        if (f === "educations") {
          return "educations.school educations.major";
        }
        return f;
      })
      .join(" ");
    const user = await UserModel.findById(ctx.params.id)
      .select(selectedFields)
      .populate(populateStr); // 添加需要用于话题的用户列表的字段
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user;
  }
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true },
    });
    // 查询该用户是否已经存在
    const { name } = ctx.request.body;
    const repeatedUser = await UserModel.findOne({ name });
    if (repeatedUser) {
      ctx.throw(409, "该用户已经存在");
    }
    const user = await new UserModel(ctx.request.body).save();
    ctx.body = user;
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      password: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      gender: { type: "string", required: false },
      headline: { type: "string", required: false },
      // 居住地 类型：数组 元素itemType是字符串
      locations: { type: "array", itemType: "string", required: false },
      business: { type: "string", required: false },
      // 职业经理 类型 数组 元素是对象
      employments: { type: "array", itemType: "object", required: false },
      educations: { type: "array", itemType: "object", required: false },
    });
    const user = await UserModel.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body
    );
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user;
  }
  async del(ctx) {
    const user = await UserModel.findByIdAndRemove(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.status = 204;
  }

  // 登录接口控制器
  async login(ctx) {
    // 1 校验用户名和密码字段
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true },
    });
    // 2 判断用户名密码是否存在
    const user = await UserModel.findOne(ctx.request.body);
    if (!user) {
      ctx.throw(401, "用户名或密码错误");
    }
    // 3 获取token
    const { _id, name } = user;
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: "1d" });
    ctx.body = { token };
  }

  // 获取关注列表
  async listFollowing(ctx) {
    const user = await UserModel.findById(ctx.params.id)
      .select("+following")
      .populate("following");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.following; // 返回用户schema的following字段
  }
  // 获取粉丝列表
  async listFollowers(ctx) {
    // 查询所有用户 但是用户的following数组字段中必须包含当前用户的ID
    const users = await UserModel.find({ following: ctx.params.id });
    ctx.body = users;
  }
  // 校验用户是否存在的中间件
  async checkUserExist(ctx, next) {
    const user = await UserModel.findById(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    await next();
  }
  // 关注某人
  async follow(ctx) {
    const me = await UserModel.findById(ctx.state.user._id).select(
      "+following"
    );
    if (!me.following.map((id) => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id);
      me.save(); // 保存到数据库
    }
    ctx.status = 204;
  }
  // 取消关注某人
  async unfollow(ctx) {
    const me = await UserModel.findById(ctx.state.user._id).select(
      "+following"
    );
    const index = me.following
      .map((id) => id.toString())
      .indexOf(ctx.params.id);
    if (index > -1) {
      me.following.splice(index, 1);
      me.save(); // 保存到数据库
    }
    ctx.status = 204;
  }

  // 获取关注的话题列表
  async listFollowingTopics(ctx) {
    const user = await UserModel.findById(ctx.params.id)
      .select("+followingTopics")
      .populate("followingTopics");
    if (!user) {
      ctx.throw(404, "话题不存在");
    }
    ctx.body = user.followingTopics; // 返回用户schema的following字段
  }

  // 关注话题
  async followTopic(ctx) {
    const me = await UserModel.findById(ctx.state.user._id).select(
      "+followingTopics"
    );
    if (
      !me.followingTopics.map((id) => id.toString()).includes(ctx.params.id)
    ) {
      me.followingTopics.push(ctx.params.id);
      me.save(); // 保存到数据库
    }
    ctx.status = 204;
  }
  // 取消关注话题
  async unfollowTopic(ctx) {
    const me = await UserModel.findById(ctx.state.user._id).select(
      "+followingTopics"
    );
    const index = me.followingTopics
      .map((id) => id.toString())
      .indexOf(ctx.params.id);
    if (index > -1) {
      me.followingTopics.splice(index, 1);
      me.save(); // 保存到数据库
    }
    ctx.status = 204;
  }
}

module.exports = new UsersController();
