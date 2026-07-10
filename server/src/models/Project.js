import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "text",
    },
  },
  { _id: false }
);

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
      enum: [
        "draft",
        "generating",
        "generated",
        "failed"
      ],
      default: "draft",
    },

    files: {
      type: [fileSchema],
      default: [],
    },

    generatedPath: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);