import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadResume = upload.single("resume");

const audioFilter = (req, file, cb) => {
  // accept all audio file types
  // browsers record in webm, mp4, ogg, wav formats
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed!"), false);
  }
};

const audioUpload = multer({
  storage,
  fileFilter: audioFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max for audio
  },
});

// 'audio' = field name frontend must use when sending file
export const uploadAudio = audioUpload.single("audio");
