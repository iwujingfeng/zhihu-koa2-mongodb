/*
 * @Author: WJF
 * @Date: 2020-01-25 19:31:36
 * @LastEditTime: 2021-01-10 08:34:03
 * @LastEditors: Please set LastEditors
 * @Description: 用户数据模型
 * @FilePath: /koa-mongodb-learn/model/users.js
 */
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  // select: false 返回数据时 隐藏密码
  password: { type: String, required: true, select: false },
  avatar_url: { type: String },
  // 性别 可枚举字符串
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
    required: true,
  },
  headline: { type: String },
  /**
   * TODO 话题引用 1、Schema.Types.ObjectId,ref:'Topics' 类型是话题model的引用
   * locations等对应的不是具体的字符串 而是一个数据库多种的话题对象
   * 修改用户的该字段 页需要传递话题的ID，这样的就把话题作为了该字段的内容
   * 居住地 类型：数组 元素是字符串 ['','']
   */
  locations: {
    type: [{ type: Schema.Types.ObjectId, ref: "Topics" }],
    select: false,
  },
  business: { type: Schema.Types.ObjectId, ref: "Topics", select: false },
  // 职业经理 类型 数组 元素是对象 对象的属性是字符串 [{company:'',job:''}]
  employments: {
    type: [
      {
        company: { type: Schema.Types.ObjectId, ref: "Topics" },
        job: { type: Schema.Types.ObjectId, ref: "Topics" },
      },
    ],
    select: false,
  },
  educations: {
    type: [
      {
        school: { type: Schema.Types.ObjectId, ref: "Topics" },
        major: { type: Schema.Types.ObjectId, ref: "Topics" },
        diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
        entrance_year: { type: Number },
        graduation_year: { type: Number },
      },
    ],
    select: false,
  },
  // 关注列表
  following: {
    type: [
      {
        type: Schema.Types.ObjectId, // 数组项是关注的人的ID
        ref: "User",
      },
    ],
    select: false,
  },
  // 关注话题
  followingTopics: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    select: false,
  },
});

module.exports = model("User", userSchema);
