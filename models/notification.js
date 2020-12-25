const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

const NotificationSchema = new Schema({
  isRead: Boolean,
  message: String,
  publication: Object,
  authorId: String,
  author_user_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  profilePicture: String,
  fullName:String,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

NotificationSchema.pre("save", async function (next) {
  this.isRead = false;
  next();
});

const NotificationModel = mongoose.model("notification", NotificationSchema);

module.exports = NotificationModel;
