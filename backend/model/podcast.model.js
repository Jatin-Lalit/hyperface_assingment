const mongoose = require("mongoose");
const PodcastSchema = mongoose.Schema({
  thumbnail: { type: String, required: true },
  coursename: { type: String, required: true },
  chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "chapter" }],
  UserId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});
const podcast = mongoose.model("podcast", PodcastSchema);

module.exports = {
  podcast,
};
