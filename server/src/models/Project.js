import mongoose from "mongoose";

const agentLogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    progress: { type: Number, default: 0 },
    logs: [{ type: String }],
    executionTimeMs: { type: Number, default: 0 },
    output: { type: Object, default: {} },
    error: { type: String, default: null },
  },
  { _id: false }
);

const generatedFileSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    type: {
      type: String,
      enum: ["file", "directory"],
      default: "file",
    },
    language: { type: String, default: null },
    content: { type: String, default: "" },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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

    transcript: {
      type: String,
      default: null,
    },

    source: {
      type: String,
      enum: ["voice", "text"],
      default: "text",
    },

    language: {
      type: String,
      default: null,
    },

    dsl: {
      type: Object,
      default: {},
    },

    framework: {
      type: String,
      default: "react-vite",
    },

    backend: {
      type: String,
      default: "express",
    },

    database: {
      type: String,
      default: "mongodb",
    },

    status: {
      type: String,
      enum: ["draft", "generating", "generated", "failed"],
      default: "draft",
    },

    pipelineStatus: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },

    agents: {
      type: [agentLogSchema],
      default: [],
    },

    files: {
      type: [generatedFileSchema],
      default: [],
    },

    generatedPath: {
      type: String,
      default: null,
    },

    previewUrl: {
      type: String,
      default: null,
    },

    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);