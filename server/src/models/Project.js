import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    language: {
      type: String,
      default: "plaintext",
    },
  },
  {
    _id: false,
  }
);

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "completed",
        "warning",
        "failed",
      ],
      default: "pending",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    executionTimeMs: {
      type: Number,
      default: 0,
    },

    logs: {
      type: [String],
      default: [],
    },

    output: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: false,
  }
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
      enum: ["text", "voice"],
      default: "text",
    },

    language: {
      type: String,
      default: null,
    },

    dsl: {
      type: mongoose.Schema.Types.Mixed,
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
      enum: [
        "draft",
        "generating",
        "generated",
        "failed",
      ],
      default: "draft",
    },

    pipelineStatus: {
      type: String,
      enum: [
        "pending",
        "running",
        "completed",
        "completed_with_warnings",
        "failed",
      ],
      default: "pending",
    },

    files: {
      type: [fileSchema],
      default: [],
    },

    agents: {
      type: [agentSchema],
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

projectSchema.index({
  owner: 1,
  createdAt: -1,
});

projectSchema.index({
  owner: 1,
  status: 1,
});

export default mongoose.model(
  "Project",
  projectSchema
);