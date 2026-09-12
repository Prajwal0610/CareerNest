const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // User who applied
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Job information
    jobId: {
      type: String,
      required: true,
      trim: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    // Applicant information
    applicantName: {
      type: String,
      default: "",
      trim: true,
    },

    applicantEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // Saved CareerNest resume
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },

    // Uploaded resume file information
    resumeFileName: {
      type: String,
      default: "",
      trim: true,
    },

    resumeFilePath: {
      type: String,
      default: "",
      trim: true,
    },

    resumeMimeType: {
      type: String,
      default: "",
      trim: true,
    },

    resumeFileSize: {
      type: Number,
      default: 0,
    },

    // Cover letter
    coverLetter: {
      type: String,
      default: "",
      trim: true,
    },

    // Application status
    status: {
      type: String,
      enum: [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Rejected",
        "Withdrawn",
      ],
      default: "Applied",
    },
  },
  {
    timestamps: true,
  }
);


// Prevent duplicate application
// Same user cannot apply twice for same job
applicationSchema.index(
  {
    userId: 1,
    jobId: 1,
  },
  {
    unique: true,
  }
);


// Prevent model overwrite error during development
module.exports =
  mongoose.models.Application ||
  mongoose.model(
    "Application",
    applicationSchema
  );