import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    dsl: {
      type: Object,
      default: {},
    },
    framework: {
      type: String,
      default: "react-vite",
    },
    status: {
      type: String,
      enum: ["draft", "generated", "failed"],
      default: "draft",
    },
    generatedPath: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);