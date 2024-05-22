import multer from "multer";
import * as path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/dreams')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export default multer({ storage: storage });
