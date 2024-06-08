import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/tempUpload");
    },
    filename: function (req, file, cb) {
        // const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9);
        // cb(null, file.fieldname + "-" + uniqueName);
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });