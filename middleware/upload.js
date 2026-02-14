import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      "image/png",
      "image/jpeg", // covers both .jpg and .jpeg
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only png and jpg files are allowed"), false);
    }

    cb(null, true);
  },
});

export default upload;
