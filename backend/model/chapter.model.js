const mongoose = require("mongoose");
const ChapterSchema = mongoose.Schema({
  courseTitle: { type: String, required: true },
  audio: [{ type: String }],
  UserId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});
const Chapter = mongoose.model("chapter", ChapterSchema);

module.exports = {
  Chapter,
};
