const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const User = require("./models/User");
const Resume = require("./models/Resume");
const Application = require("./models/Application");
const Job = require("./models/Job");
const authMiddleware = require("./authMiddleware");

const app = express();

/* =====================================================
   ENVIRONMENT CONFIGURATION
===================================================== */

const PORT = Number(process.env.PORT) || 5000;

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "")
  .toLowerCase()
  .trim();

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173,http://localhost:5174,http://localhost:5175"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);


/* =====================================================
   ENVIRONMENT VALIDATION
===================================================== */

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env");
  process.exit(1);
}

if (!ADMIN_EMAIL) {
  console.warn(
    "⚠️ ADMIN_EMAIL is not configured. Admin routes will be unavailable."
  );
}


/* =====================================================
   RESUME UPLOAD DIRECTORY
===================================================== */

const uploadsDirectory = path.join(
  __dirname,
  "uploads",
  "resumes"
);

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, {
    recursive: true,
  });
}


/* =====================================================
   MULTER CONFIGURATION
===================================================== */

const allowedResumeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const allowedResumeExtensions = [
  ".pdf",
  ".doc",
  ".docx",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueName =
      `resume-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, uniqueName);
  },
});

const uploadResume = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const validMimeType =
      allowedResumeTypes.includes(
        file.mimetype
      );

    const validExtension =
      allowedResumeExtensions.includes(
        extension
      );

    if (validMimeType && validExtension) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Only PDF, DOC and DOCX files are allowed."
      )
    );
  },
});


/* =====================================================
   CORS
===================================================== */

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman and server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(
        `Blocked CORS request from: ${origin}`
      );

      return callback(
        new Error("CORS origin not allowed.")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);


/* =====================================================
   BODY PARSERS
===================================================== */

app.use(
  express.json({
    limit: "100kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "100kb",
  })
);


/* =====================================================
   DATABASE CONNECTION
===================================================== */

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB Connected Successfully ✅"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB Connection Failed ❌"
    );

    console.error(error.message);

    process.exit(1);
  });


/* =====================================================
   JWT
===================================================== */

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId: userId.toString(),
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


/* =====================================================
   ADMIN AUTHORIZATION
===================================================== */

const requireAdmin = async (
  req,
  res,
  next
) => {
  try {
    if (!ADMIN_EMAIL) {
      return res.status(503).json({
        success: false,
        message:
          "Admin access is not configured.",
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const user = await User.findById(
      req.user.userId
    ).select("fullName email");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    const userEmail = user.email
      .toLowerCase()
      .trim();

    if (userEmail !== ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access denied.",
      });
    }

    req.adminUser = user;

    next();
  } catch (error) {
    console.error(
      "Admin Authorization Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify admin access.",
    });
  }
};


/* =====================================================
   HOME / HEALTH CHECK
===================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "CareerNest Backend is running 🚀",
  });
});


/* =====================================================
   DATABASE HEALTH CHECK
   Protected - Admin Only
===================================================== */

app.get(
  "/api/test-db",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const [
        users,
        resumes,
        applications,
        jobs,
      ] = await Promise.all([
        User.countDocuments(),
        Resume.countDocuments(),
        Application.countDocuments(),
        Job.countDocuments(),
      ]);

      res.status(200).json({
        success: true,
        message:
          "MongoDB is connected successfully ✅",
        users,
        resumes,
        applications,
        jobs,
      });
    } catch (error) {
      console.error(
        "Database Test Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Database test failed.",
      });
    }
  }
);


/* =====================================================
   AUTH - SIGNUP
===================================================== */

app.post(
  "/api/auth/signup",
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
      } = req.body;

      if (
        !fullName?.trim() ||
        !email?.trim() ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please fill in all fields.",
        });
      }

      if (fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Full name must contain at least 2 characters.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      const cleanEmail =
        email.toLowerCase().trim();

      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists.",
        });
      }

      const user =
        await User.create({
          fullName:
            fullName.trim(),

          email: cleanEmail,

          password,
        });

      const token =
        generateToken(user._id);

      res.status(201).json({
        success: true,
        message:
          "Account created successfully.",

        token,

        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(
        "Signup Error:",
        error.message
      );

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists.",
        });
      }

      res.status(500).json({
        success: false,
        message:
          "Unable to create account.",
      });
    }
  }
);


/* =====================================================
   AUTH - LOGIN
===================================================== */

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email?.trim() ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter your email and password.",
        });
      }

      const cleanEmail =
        email.toLowerCase().trim();

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      const passwordCorrect =
        await user.comparePassword(
          password
        );

      if (!passwordCorrect) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      const token =
        generateToken(user._id);

      res.status(200).json({
        success: true,
        message:
          "Login successful.",

        token,

        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(
        "Login Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to login. Please try again.",
      });
    }
  }
);


/* =====================================================
   AUTH - CURRENT USER
===================================================== */

app.get(
  "/api/auth/me",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.userId
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      res.status(200).json({
        success: true,

        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          createdAt:
            user.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "Get User Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch user.",
      });
    }
  }
);


/* =====================================================
   JOBS - PUBLIC LIST
===================================================== */

app.get(
  "/api/jobs",
  async (req, res) => {
    try {
      const jobs =
        await Job.find({
          isActive: true,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        count: jobs.length,
        jobs,
      });
    } catch (error) {
      console.error(
        "Get Jobs Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch jobs.",
      });
    }
  }
);


/* =====================================================
   JOBS - SINGLE PUBLIC JOB
===================================================== */

app.get(
  "/api/jobs/:id",
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid job ID.",
        });
      }

      const job =
        await Job.findOne({
          _id: req.params.id,
          isActive: true,
        });

      if (!job) {
        return res.status(404).json({
          success: false,
          message:
            "Job not found.",
        });
      }

      res.status(200).json({
        success: true,
        job,
      });
    } catch (error) {
      console.error(
        "Get Single Job Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch job.",
      });
    }
  }
);


/* =====================================================
   ADMIN - CHECK ACCESS
===================================================== */

app.get(
  "/api/admin/me",
  authMiddleware,
  requireAdmin,
  (req, res) => {
    res.status(200).json({
      success: true,

      admin: {
        id:
          req.adminUser._id,

        fullName:
          req.adminUser.fullName,

        email:
          req.adminUser.email,
      },
    });
  }
);


/* =====================================================
   ADMIN - GET ALL JOBS
===================================================== */

app.get(
  "/api/admin/jobs",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const jobs =
        await Job.find({})
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count: jobs.length,
        jobs,
      });
    } catch (error) {
      console.error(
        "Admin Get Jobs Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch admin jobs.",
      });
    }
  }
);


/* =====================================================
   ADMIN - CREATE JOB
===================================================== */

app.post(
  "/api/admin/jobs",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        company,
        location,
        type,
        salary,
        experience,
        companyInitials,
        description,
        responsibilities,
        requirements,
        skills,
        whyConsider,
      } = req.body;

      if (
        !title?.trim() ||
        !company?.trim() ||
        !salary?.trim() ||
        !description?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, company, salary and description are required.",
        });
      }

      const cleanArray = (value) => {
        if (Array.isArray(value)) {
          return value
            .map((item) =>
              String(item).trim()
            )
            .filter(Boolean);
        }

        if (typeof value === "string") {
          return value
            .split("\n")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean);
        }

        return [];
      };

      const job =
        await Job.create({
          title: title.trim(),

          company:
            company.trim(),

          location:
            location?.trim() || "",

          type:
            type?.trim() ||
            "Full Time",

          salary:
            salary.trim(),

          experience:
            experience?.trim() ||
            "Fresher",

          companyInitials:
            companyInitials
              ?.trim()
              .toUpperCase() ||
            company
              .trim()
              .slice(0, 2)
              .toUpperCase(),

          description:
            description.trim(),

          responsibilities:
            cleanArray(
              responsibilities
            ),

          requirements:
            cleanArray(
              requirements
            ),

          skills:
            cleanArray(skills),

          whyConsider:
            cleanArray(
              whyConsider
            ),

          isActive: true,
        });

      res.status(201).json({
        success: true,
        message:
          "Job created successfully.",
        job,
      });
    } catch (error) {
      console.error(
        "Create Job Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to create job.",
      });
    }
  }
);


/* =====================================================
   ADMIN - UPDATE JOB
===================================================== */

app.put(
  "/api/admin/jobs/:id",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid job ID.",
        });
      }

      const job =
        await Job.findById(
          req.params.id
        );

      if (!job) {
        return res.status(404).json({
          success: false,
          message:
            "Job not found.",
        });
      }

      const {
        title,
        company,
        location,
        type,
        salary,
        experience,
        companyInitials,
        description,
        responsibilities,
        requirements,
        skills,
        whyConsider,
      } = req.body;

      const cleanArray = (value) => {
        if (Array.isArray(value)) {
          return value
            .map((item) =>
              String(item).trim()
            )
            .filter(Boolean);
        }

        return String(value || "")
          .split("\n")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);
      };

      if (title !== undefined) {
        if (!String(title).trim()) {
          return res.status(400).json({
            success: false,
            message:
              "Job title cannot be empty.",
          });
        }

        job.title =
          String(title).trim();
      }

      if (company !== undefined) {
        if (!String(company).trim()) {
          return res.status(400).json({
            success: false,
            message:
              "Company cannot be empty.",
          });
        }

        job.company =
          String(company).trim();
      }

      if (location !== undefined) {
        job.location =
          String(location).trim();
      }

      if (type !== undefined) {
        job.type =
          String(type).trim();
      }

      if (salary !== undefined) {
        if (!String(salary).trim()) {
          return res.status(400).json({
            success: false,
            message:
              "Salary cannot be empty.",
          });
        }

        job.salary =
          String(salary).trim();
      }

      if (experience !== undefined) {
        job.experience =
          String(experience).trim();
      }

      if (
        companyInitials !==
        undefined
      ) {
        job.companyInitials =
          String(companyInitials)
            .trim()
            .toUpperCase();
      }

      if (description !== undefined) {
        if (!String(description).trim()) {
          return res.status(400).json({
            success: false,
            message:
              "Description cannot be empty.",
          });
        }

        job.description =
          String(description).trim();
      }

      if (
        responsibilities !==
        undefined
      ) {
        job.responsibilities =
          cleanArray(
            responsibilities
          );
      }

      if (
        requirements !==
        undefined
      ) {
        job.requirements =
          cleanArray(
            requirements
          );
      }

      if (skills !== undefined) {
        job.skills =
          cleanArray(skills);
      }

      if (
        whyConsider !==
        undefined
      ) {
        job.whyConsider =
          cleanArray(
            whyConsider
          );
      }

      await job.save();

      res.status(200).json({
        success: true,
        message:
          "Job updated successfully.",
        job,
      });
    } catch (error) {
      console.error(
        "Update Job Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to update job.",
      });
    }
  }
);


/* =====================================================
   ADMIN - TOGGLE JOB
===================================================== */

app.patch(
  "/api/admin/jobs/:id/toggle",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid job ID.",
        });
      }

      const job =
        await Job.findById(
          req.params.id
        );

      if (!job) {
        return res.status(404).json({
          success: false,
          message:
            "Job not found.",
        });
      }

      job.isActive =
        !job.isActive;

      await job.save();

      res.status(200).json({
        success: true,

        message: job.isActive
          ? "Job activated successfully."
          : "Job deactivated successfully.",

        job,
      });
    } catch (error) {
      console.error(
        "Toggle Job Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to change job status.",
      });
    }
  }
);


/* =====================================================
   ADMIN - DELETE JOB
===================================================== */

app.delete(
  "/api/admin/jobs/:id",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid job ID.",
        });
      }

      const job =
        await Job.findById(
          req.params.id
        );

      if (!job) {
        return res.status(404).json({
          success: false,
          message:
            "Job not found.",
        });
      }

      await Job.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        success: true,
        message:
          "Job deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Job Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to delete job.",
      });
    }
  }
);

/* =====================================================
   RESUME - GET
===================================================== */

app.get(
  "/api/resume",
  authMiddleware,
  async (req, res) => {
    try {
      const resume =
        await Resume.findOne({
          userId:
            req.user.userId,
        });

      if (!resume) {
        return res.status(404).json({
          success: false,
          message:
            "No saved resume found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Resume fetched successfully.",
        resume,
      });
    } catch (error) {
      console.error(
        "Get Resume Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch resume.",
      });
    }
  }
);


/* =====================================================
   RESUME - SAVE / UPDATE
===================================================== */

app.post(
  "/api/resume",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        fullName,
        jobTitle,
        email,
        phone,
        location,
        summary,
        education,
        experience,
        skills,
        certifications,
        projects,
        selectedTemplate,
      } = req.body;

      const resumeData = {
        userId:
          req.user.userId,

        fullName:
          fullName?.trim() || "",

        jobTitle:
          jobTitle?.trim() || "",

        email:
          email?.trim() || "",

        phone:
          phone?.trim() || "",

        location:
          location?.trim() || "",

        summary:
          summary?.trim() || "",

        education:
          education?.trim() || "",

        experience:
          experience?.trim() || "",

        skills:
          skills?.trim() || "",

        certifications:
          certifications?.trim() || "",

        projects:
          projects?.trim() || "",

        selectedTemplate:
          selectedTemplate ||
          "modern",
      };

      const existingResume =
        await Resume.findOne({
          userId:
            req.user.userId,
        });

      if (!existingResume) {
        const newResume =
          await Resume.create(
            resumeData
          );

        return res.status(201).json({
          success: true,
          message:
            "Resume saved successfully.",
          resume: newResume,
        });
      }

      Object.assign(
        existingResume,
        resumeData
      );

      const updatedResume =
        await existingResume.save();

      res.status(200).json({
        success: true,
        message:
          "Resume updated successfully.",
        resume: updatedResume,
      });
    } catch (error) {
      console.error(
        "Save Resume Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to save resume.",
      });
    }
  }
);


/* =====================================================
   RESUME - DELETE
===================================================== */

app.delete(
  "/api/resume",
  authMiddleware,
  async (req, res) => {
    try {
      const deletedResume =
        await Resume.findOneAndDelete({
          userId:
            req.user.userId,
        });

      if (!deletedResume) {
        return res.status(404).json({
          success: false,
          message:
            "No saved resume found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Resume deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Resume Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to delete resume.",
      });
    }
  }
);


/* =====================================================
   APPLICATION - CREATE
===================================================== */

app.post(
  "/api/applications",
  authMiddleware,
  uploadResume.single("resume"),
  async (req, res) => {
    try {
      const {
        jobId,
        jobTitle,
        company,
        location,
        applicantName,
        applicantEmail,
        phone,
        resumeId,
        coverLetter,
      } = req.body;

      const removeUploadedFile = () => {
        if (
          req.file?.path &&
          fs.existsSync(
            req.file.path
          )
        ) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch (error) {
            console.error(
              "Unable to remove uploaded file:",
              error.message
            );
          }
        }
      };

      if (
        !jobId ||
        !jobTitle?.trim() ||
        !company?.trim()
      ) {
        removeUploadedFile();

        return res.status(400).json({
          success: false,
          message:
            "Job information is required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload your resume.",
        });
      }

      const existingApplication =
        await Application.findOne({
          userId:
            req.user.userId,

          jobId:
            String(jobId),
        });

      if (existingApplication) {
        removeUploadedFile();

        return res.status(409).json({
          success: false,
          message:
            "You have already applied to this job.",
          application:
            existingApplication,
        });
      }

      const application =
        await Application.create({
          userId:
            req.user.userId,

          jobId:
            String(jobId),

          jobTitle:
            jobTitle.trim(),

          company:
            company.trim(),

          location:
            location?.trim() || "",

          applicantName:
            applicantName?.trim() || "",

          applicantEmail:
            applicantEmail
              ?.trim()
              .toLowerCase() || "",

          phone:
            phone?.trim() || "",

          resumeId:
            resumeId || null,

          resumeFileName:
            req.file.originalname,

          resumeFilePath:
            req.file.filename,

          resumeMimeType:
            req.file.mimetype,

          resumeFileSize:
            req.file.size,

          coverLetter:
            coverLetter?.trim() || "",

          status:
            "Applied",
        });

      res.status(201).json({
        success: true,
        message:
          "Application submitted successfully.",
        application,
      });
    } catch (error) {
      console.error(
        "Create Application Error:",
        error.message
      );

      if (
        req.file?.path &&
        fs.existsSync(
          req.file.path
        )
      ) {
        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch {}
      }

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "You have already applied to this job.",
        });
      }

      res.status(500).json({
        success: false,
        message:
          "Unable to submit application.",
      });
    }
  }
);


/* =====================================================
   APPLICATION - CURRENT USER
===================================================== */

app.get(
  "/api/applications",
  authMiddleware,
  async (req, res) => {
    try {
      const applications =
        await Application.find({
          userId:
            req.user.userId,
        })
          .populate("resumeId")
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        applications,
      });
    } catch (error) {
      console.error(
        "Get Applications Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch applications.",
      });
    }
  }
);


/* =====================================================
   APPLICATION - SINGLE
===================================================== */

app.get(
  "/api/applications/:id",
  authMiddleware,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application ID.",
        });
      }

      const application =
        await Application.findOne({
          _id: req.params.id,

          userId:
            req.user.userId,
        }).populate("resumeId");

      if (!application) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found.",
        });
      }

      res.status(200).json({
        success: true,
        application,
      });
    } catch (error) {
      console.error(
        "Get Application Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch application.",
      });
    }
  }
);


/* =====================================================
   APPLICATION - VIEW / DOWNLOAD RESUME
===================================================== */

app.get(
  "/api/applications/:id/resume",
  authMiddleware,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application ID.",
        });
      }

      const application =
        await Application.findById(
          req.params.id
        );

      if (!application) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found.",
        });
      }

      const isOwner =
        application.userId
          .toString() ===
        req.user.userId.toString();

      let isAdmin = false;

      if (ADMIN_EMAIL) {
        const user =
          await User.findById(
            req.user.userId
          ).select("email");

        isAdmin =
          !!user &&
          user.email
            .toLowerCase()
            .trim() ===
          ADMIN_EMAIL;
      }

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this resume.",
        });
      }

      if (
        !application.resumeFilePath
      ) {
        return res.status(404).json({
          success: false,
          message:
            "No uploaded resume file found.",
        });
      }

      const filePath =
        path.join(
          uploadsDirectory,
          application.resumeFilePath
        );

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message:
            "Resume file is missing from server storage.",
        });
      }

      const resolvedFilePath =
        path.resolve(filePath);

      const resolvedUploadDirectory =
        path.resolve(
          uploadsDirectory
        );

      // Prevent path traversal
      if (
        !resolvedFilePath.startsWith(
          resolvedUploadDirectory +
            path.sep
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid resume file path.",
        });
      }

      res.setHeader(
        "Content-Type",
        application.resumeMimeType ||
          "application/octet-stream"
      );

      const safeFileName =
        (
          application.resumeFileName ||
          "resume"
        ).replace(
          /["\r\n]/g,
          ""
        );

      const disposition =
        req.query.download === "true"
          ? "attachment"
          : "inline";

      res.setHeader(
        "Content-Disposition",
        `${disposition}; filename="${safeFileName}"`
      );

      res.sendFile(
        resolvedFilePath
      );
    } catch (error) {
      console.error(
        "Resume File Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to open resume.",
      });
    }
  }
);


/* =====================================================
   APPLICATION - WITHDRAW
===================================================== */

app.patch(
  "/api/applications/:id/withdraw",
  authMiddleware,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application ID.",
        });
      }

      const application =
        await Application.findOne({
          _id: req.params.id,

          userId:
            req.user.userId,
        });

      if (!application) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found.",
        });
      }

      if (
        application.status ===
          "Rejected" ||
        application.status ===
          "Withdrawn"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Application cannot be withdrawn because its status is ${application.status}.`,
        });
      }

      application.status =
        "Withdrawn";

      await application.save();

      res.status(200).json({
        success: true,
        message:
          "Application withdrawn successfully.",
        application,
      });
    } catch (error) {
      console.error(
        "Withdraw Application Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to withdraw application.",
      });
    }
  }
);


/* =====================================================
   ADMIN - ALL APPLICATIONS
===================================================== */

app.get(
  "/api/admin/applications",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const applications =
        await Application.find({})
          .populate(
            "userId",
            "fullName email createdAt"
          )
          .populate("resumeId")
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        applications,
      });
    } catch (error) {
      console.error(
        "Admin Applications Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch applications.",
      });
    }
  }
);


/* =====================================================
   ADMIN - STATISTICS
===================================================== */

app.get(
  "/api/admin/stats",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const [
        totalApplications,
        applied,
        underReview,
        shortlisted,
        rejected,
        withdrawn,
        totalUsers,
        totalJobs,
        activeJobs,
      ] = await Promise.all([
        Application.countDocuments(),

        Application.countDocuments({
          status: "Applied",
        }),

        Application.countDocuments({
          status: "Under Review",
        }),

        Application.countDocuments({
          status: "Shortlisted",
        }),

        Application.countDocuments({
          status: "Rejected",
        }),

        Application.countDocuments({
          status: "Withdrawn",
        }),

        User.countDocuments(),

        Job.countDocuments(),

        Job.countDocuments({
          isActive: true,
        }),
      ]);

      res.status(200).json({
        success: true,

        stats: {
          total:
            totalApplications,

          totalApplications,

          applied,

          underReview,

          shortlisted,

          rejected,

          withdrawn,

          users:
            totalUsers,

          totalUsers,

          jobs:
            totalJobs,

          totalJobs,

          activeJobs,
        },
      });
    } catch (error) {
      console.error(
        "Admin Stats Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch admin statistics.",
      });
    }
  }
);


/* =====================================================
   ADMIN - UPDATE APPLICATION STATUS
===================================================== */

app.patch(
  "/api/admin/applications/:id/status",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application ID.",
        });
      }

      const allowedStatuses = [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Rejected",
        "Withdrawn",
      ];

      const status =
        req.body?.status;

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application status.",
        });
      }

      const application =
        await Application.findById(
          req.params.id
        );

      if (!application) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found.",
        });
      }

      application.status =
        status;

      await application.save();

      res.status(200).json({
        success: true,
        message:
          "Application status updated successfully.",
        application,
      });
    } catch (error) {
      console.error(
        "Admin Status Update Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to update application status.",
      });
    }
  }
);


/* =====================================================
   LOGOUT
===================================================== */

app.post(
  "/api/auth/logout",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Logout successful.",
    });
  }
);


/* =====================================================
   MULTER / GENERAL ERROR HANDLER
===================================================== */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Server Error:",
      error.message
    );

    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Resume size must be less than 5 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          "Resume upload failed.",
      });
    }

    if (
      error.message ===
      "Only PDF, DOC and DOCX files are allowed."
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    if (
      error.message ===
      "CORS origin not allowed."
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Request origin is not allowed.",
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Internal server error.",
    });
  }
);


/* =====================================================
   404 HANDLER
===================================================== */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "API route not found.",
      path:
        req.originalUrl,
    });
  }
);


/* =====================================================
   START SERVER
===================================================== */

const server =
  app.listen(
    PORT,
    () => {
      console.log(
        `CareerNest Backend running on http://localhost:${PORT}`
      );

      console.log(
        "Resume upload storage: backend/uploads/resumes"
      );

      console.log(
        `Allowed Frontend Origins: ${allowedOrigins.join(", ")}`
      );
    }
  );


/* =====================================================
   GRACEFUL SHUTDOWN
===================================================== */

const shutdownServer = async (
  signal
) => {
  console.log(
    `${signal} received. Shutting down server...`
  );

  server.close(async () => {
    try {
      await mongoose.connection.close();

      console.log(
        "MongoDB connection closed."
      );

      console.log(
        "CareerNest Backend stopped."
      );

      process.exit(0);
    } catch (error) {
      console.error(
        "Shutdown Error:",
        error.message
      );

      process.exit(1);
    }
  });
};

process.on(
  "SIGINT",
  () =>
    shutdownServer("SIGINT")
);

process.on(
  "SIGTERM",
  () =>
    shutdownServer("SIGTERM")
);


/* =====================================================
   UNHANDLED ERRORS
===================================================== */

process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "Unhandled Promise Rejection:",
      reason
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "Uncaught Exception:",
      error
    );
  }
);