const router = require("express").Router();
const fileUploader = require('/Users/thanhninh/Documents/CCNPMM/youtube/client/src/s3.config');


router.post("/", fileUploader.single("file"), (req, res) => {
    try {
        return res.status(200).json({"status": true, "url": req.file.location});
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;
