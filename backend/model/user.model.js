const mongoose = require("mongoose");
const UsserSchema = mongoose.Schema({
  email: { type: String, required: true },
  phoneNumber: { type: Number, require: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String },
  role: { type: String, enum: ["User", "Admin"], default: "User" },
});
const User = mongoose.model("user", UsserSchema);

module.exports = {
  User,
};
