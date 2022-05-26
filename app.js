var express = require("express");
var path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");
var imageModel = require("./models/imageModel");

var app = express();
const PORT = process.env.PORT || 3001;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(
	process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/node-image-test",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);

// SET STORAGE
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads");
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now());
	},
});

var upload = multer({ storage: storage });

app.get(["/", "/all"], async (req, res) => {
	const imageResults = await imageModel.find({});
	const bufferedResults = await imageResults.map(image => {
		return new Buffer.from(image.img.data).toString("base64");
	});
	res.render("index", { images: bufferedResults });
});

app.post("/uploadphoto", upload.single("myImage"), (req, res) => {
	var img = fs.readFileSync(req.file.path);
	var encode_img = img.toString("base64");
	var final_img = {
		contentType: req.file.mimetype,
		name: req.file.originalname,
		img: {
			data: new Buffer.from(encode_img, "base64"),
			contentType: req.file.mimetype,
		},
	};
	imageModel.create(final_img, function (err, result) {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/all");
		}
	});
});

//Code to start server
app.listen(PORT, function () {
	console.log(`Server Started at PORT ${PORT}`);
});

module.exports = app;
