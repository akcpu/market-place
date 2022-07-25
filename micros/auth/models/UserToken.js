const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserVerificationTokenSchema = new Schema({
  objectId: { type: String, required: true },
  code: { type: String, required: true },
  target: { type: String, required: true },
  targetType: { type: String, required: true },
  counter: { type: Number, default: 0 },
  created_date: { type: Date, default: Date.now },
  remoteIpAddress: { type: String, required: true },
  userId: { type: String, required: true, trim: true, unique: true },
  isVerified: { type: Boolean, required: true, default: false },
  last_updated: { type: Date, default: Date.now },
  // userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
  // token: { type: String, required: true },
  // createdAt: { type: Date, default: Date.now, expires: 30 * 86400 }, // 30 days
});

module.exports = mongoose.model("UserToken", UserVerificationTokenSchema);
