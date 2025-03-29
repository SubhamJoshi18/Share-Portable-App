import mongoose from "mongoose";
import {
  FILE_LOADED,
  FILE_PROCESS,
  FILE_SENDED,
  FILE_UPLOAD,
} from "../../constants/file.constant";

const UrlSchema = new mongoose.Schema(
  {
    longUrl: {
      type: String,
    },

    shortUrl: {
      type: String,
    },

    clickCount: {
      type: Number,
      default: 0,
    },

    urlId: {
      type: String,
      required: [true, "Url Id Must be Required"],
    },

    status: {
      type: String,
      enum: [FILE_LOADED, FILE_PROCESS, FILE_UPLOAD, FILE_SENDED],
      default: "idle",
    },
  },
  {
    timestamps: true,
  }
);

const UrlModel = mongoose.model("Url Model", UrlSchema);
export default UrlModel;
