const path = require("path");
const express = require("express");
const session = require("express-session");
const logger = require("morgan");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const shortId = require("shortid");
const config = require("../config/config");
const uploadController = require("./../controllers/upload");
// const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const templates_url = path.join(__dirname, "../templates/");
const uploads_url = path.join(__dirname, "../../uploads/");

// var corsOptions = {
//   origin: [
//     "http://localhost",
//     "capacitor://localhost",
//     "http://localhost:3000",
//     "http://localhost:3002",
//     "https://app.ipaayos.tividad.com",
//     "https://pro.ipaayos.tividad.com",
//     "https://admin.socket.io",
//   ],
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

const allowCrossDomain = function(req:any, res:any, next:any) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
app.use(allowCrossDomain);

// app.use(cors(corsOptions));
app.use(cors());
app.use(express.static("public"));
// app.use(
//   express.static("public"),
//   createProxyMiddleware({
//     target: "http://localhost:3002",
//     changeOrigin: true,
//   })
// );
// app.use('/uploads', express.static(uploads_url));
app.use(express.static(templates_url));
app.set("view engine", "pug");

// app.set('trust proxy', 1); // trust first proxy
// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true,
//     cookie: {},
// }));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// multipart data handling
// set the directory for the uploads to the uploaded to
//-- Note: data order must be folder, isnewname and images
const DIR = "./uploads/user";
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    // console.log("req.body >>>>", req.body, file);
    // console.log("Got ya");
    // console.log(file.originalname);
    cb(null, DIR);
  },
  filename: (req: any, file: any, cb: any) => {
    // console.log("req.body >>>>", req.body.isnewname, file);
    let filename = file.originalname;
    if (req.body?.isnewname?.toLowerCase() === "true") {
      filename = Date.now() + path.extname(file.originalname);
    }
    cb(null, filename);
  },
});

app.use(multer({ storage }).any());
app.use(logger("dev"));
app.use("/uploads", express.static(path.join(__dirname, "../../uploads/")));

app.post(
  "/upload",
  uploadController.uploadMedias,
  uploadController.moveMedias,
  uploadController.resizeImages,
  uploadController.getUploadResult
);
app.post(
  "/upload/image",
  uploadController.uploadBase64Image,
  uploadController.resizeImages,
  uploadController.getUploadResult
);

export default app;
