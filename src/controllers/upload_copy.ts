/**************
  
 
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
// const mime = require("mime");
// const mime = require('mime-types')

// const DIR = "./uploads/user/";
const DIR = "./uploads/user/";
const MAX_UPLOAD = 10;

fs.access(DIR, (err: any) => {
  if (err) {
    fs.mkdirSync(DIR);
  }
});

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    // console.log("destination >>>>>", file.originalname, req.body.email);
    console.log("destination >>>>>", file.originalname);
    cb(null, DIR);
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, file.originalname);
    // cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  //// limits:{fileSize: 1000000},
  //// fileFilter: function(req, file, cb){
  ////   checkFileType(file, cb);
  //// }
});

// Check File Type
const checkFileType = (file: any, cb: any) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
};

const uploadFiles = upload.array("images", MAX_UPLOAD); // limit to 10 images

const uploadImages = (req: any, res: any, next: any) => {
  try {
    uploadFiles(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          // Too many images exceeding the allowed limit
          // ...
        }
      } else if (err) {
        // handle other errors
      }

      // res.send("File/s uploaded.");
      // Everything is ok.
      next();
    });
  } catch (err) {
    // res.send(`Something went wrong while processing your request. ERR: ${err}`);
    return res.status(500).json({
      status: 500,
      msg: `Something went wrong while process your request. ERR ${err}`,
    });
  }
};

const resizeImages_old = async (req: any, res: any, next: any) => {
  try {
    req.files = res.files;
    req.body = res.locals;
    if (!req.files) return next();

    // console.log("req.body >>>>", req.body, req.files);

    req.body.images = [];
    await Promise.all(
      req.files.map(async (file: any) => {
        console.log("file>>>>>", file);

        const EXT = path.extname(file.originalname);
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(EXT);
        if (extname) {
         
          //-- rename resized file to oiginal file
          const tmpFilename = file.path.replace(EXT, `-tmp${EXT}`);
          // console.log("tmpfile >>>>>", tmpFilename);
          // console.log("orig file>>>>>", file.path);

          fs.rename(file.path, tmpFilename, (err: any) => {
            if (err) {
              return console.error(err);
            } else {
            }
          });
          await sharp(tmpFilename)
            .toFormat("jpeg")
            .resize({ width: 200 })
            .jpeg({ quality: 90 })
            .toFile(file.path);

          fs.unlinkSync(tmpFilename);
        }
      })
    );

    next();
  } catch (err) {
    // res.send(`Something went wrong while processing your request. ERR: ${err}`);
    return res.status(500).json({
      status: 500,
      msg: `Something went wrong while process your request. ERR ${err}`,
    });
  }
};

// const sleep = async (ms: any) => {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// };

const resizeImages = async (req: any, res: any, next: any) => {
  try {
    req.files = res.files;
    req.body = res.locals;
    if (!req.files) return next();

    // console.log("req.body >>>>", req.body, req.files);

    req.body.images = [];
    const reqFiles: any = req.files.filter((file: any) =>
      file.filename.includes("~200")
    );
    await Promise.all(
      //-- add ~200 suffix to resize image into 200dpi
      reqFiles.map(async (file: any, index: number) => {
        // console.log("file>>>>>", file);

        const EXT = path.extname(file.originalname);
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(EXT);
        if (extname) {
          // //-- rename resized file to oiginal file
          // const tmpFilename = file.path.replace(EXT, `-tmp${EXT}`);
          // // console.log("tmpfile >>>>>", tmpFilename);
          // // console.log("orig file>>>>>", file.path);

          // try {
          const newFilename = file.filename.replace(`~200${EXT}`, EXT);
          const newFilePath = file.path.replace(`~200${EXT}`, EXT);

          // console.log("newFilePath, file.path >>>>>", newFilePath, file.path);
          if (fs.existsSync(newFilePath)) {
            fs.unlinkSync(newFilePath, (err: any) => {
              console.log("err: ", err);
            });
          } 

          await sharp(file.path)
            .toFormat("jpeg")
            .resize({ width: 200 })
            .jpeg({ quality: 90 })
            .toFile(newFilePath);

          if (fs.existsSync(newFilePath) && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path, (err: any) => {
              console.log("err: ", err);
            });
          }

          ////// reqFiles[index] = { ...file, path: newFilePath, filename: newFilename }
          reqFiles[index] = {
            ...file,
            path: newFilePath.replace("./", process.env.BASE_URL),
            filename: newFilename.replace("./", process.env.BASE_URL),
          };
          // req.files[index] = { ...file, filename: newFilename }
          // console.log(" reqFiles >>>>", reqFiles);
          // console.log(" (file.filename, newFilename) >>>>", (file.filename, newFilename))
        }
      })
    );
    res.files = [...reqFiles];

    next();
  } catch (err) {
    // res.send(`Something went wrong while processing your request. ERR: ${err}`);
    return res.status(500).json({
      status: 500,
      msg: `Something went wrong while process your request. ERR ${err}`,
    });
  }
};

const getResult = async (req: any, res: any) => {
  try {
    // console.log("req.body.images >>>>>", req.body.images);

    if (req.body.images === undefined || req.body.images.length <= 0) {
      return res.send(`You must select at least 1 image.`);
    }
    const images = req.body.images
      .map((image: any) => "" + image + "")
      .join(", ");
    // return res.send(`Images were uploaded: ${images}`);
    return res.status(200).json({
      status: 200,
      msg: `Images were uploaded: ${images}`,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      msg: `Something went wrong while process your request. ERR ${err}`,
    });
  }
};
//////////////////////////
const getUploadResult = async (req: any, res: any) => {
  try {
    // req.files = res.files;
    // req.body = res.locals;
    // console.log("res.files >>>>>", res.files);

    return res.status(200).json({
      status: 200,
      msg: `File(s) were successfully uploaded!`,
      files: res.files,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      msg: `Something went wrong while process your request. ERR ${err}`,
    });
  }
};

const moveMedias = async (req: any, res: any, next: any) => {
  try {
    req.files = res.files;
    req.body = res.locals;
    req.body.images = [];
    await Promise.all(
      req.files.map(async (file: any) => {
        // console.log("req.body >>>>>", req.body.folder, req.body.images);
        if (!req.body.folder) {
          req.body.folder = "temp";
        }

        const DIR_NEW = (DIR + `${req.body.folder}/`).toLowerCase();

        // console.log("DIR_NEW>>>", DIR_NEW);

        if (!fs.existsSync(DIR_NEW)) {
          fs.mkdirSync(DIR_NEW);
        }

        file.destination = DIR_NEW;
        file.path = DIR_NEW + file.filename;
        fs.rename(DIR + file.filename, DIR_NEW + file.filename, (err: any) => {
          if (err) {
            return console.error(err);
          }
        });
      })
    );
    next();
  } catch (err) {
    return res.status(500).json({
      status: 500,
      msg: `Something went wrong while process your request. ERR ${err}`,
    });
  }
};
const uploadMedias = (req: any, res: any, next: any) => {
  try {
    if (req.files) {
      res.files = req.files;
    }
    if (req.body) {
      res.locals = req.body;
    }

    uploadFiles(req, res, (err: any) => {
      // console.log("uploadMedias req>>>>>", req);
      // console.log("req.email>>>>>", req.email);
      // console.log("req.images>>>>>", req.images);
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          // Too many images exceeding the allowed limit
          // ...
        }
      } else if (err) {
        // handle other errors
      }

      // res.send("File/s uploaded.");
      // Everything is ok.
      next();
    });
  } catch (err) {
    // res.send(`Something went wrong while processing your request. ERR: ${err}`);
    return res.status(500).json({
      status: 500,
      msg: `Something went wrong while process your request. ERR ${err}`,
    });
  }
};
const uploadBase64Image = async (req: any, res: any, next: any) => {
  // console.log("req.body>>>", req.body);
  // to declare some path to store your converted image
  let matches: any = req.body.base64image.match(
      /^data:([A-Za-z-+/]+);base64,(.+)$/
    ),
    folder: any = req.body.folder,
    fileName: any = req.body.filename,
    response: any = {};

  if (matches.length !== 3) {
    return new Error("Invalid input string");
  }

  response.type = matches[1];
  // response.data = new Buffer(matches[2], "base64");
  response.data = Buffer.from(matches[2], "base64");
  let decodedImg = response;
  let imageBuffer = decodedImg.data;
  let type = decodedImg.type;
  // let extension = mime.extension(type);
  let extension = "jpg";
  if (!fileName) {
    fileName = "image." + extension;
  }
  if (!folder) {
    folder = "images";
  }
  const DIR_NEW = (DIR + `${folder}/`).toLowerCase();
  // console.log("DIR_NEW, fileName>>>", DIR_NEW, fileName);
  if (!fs.existsSync(DIR_NEW)) {
    fs.mkdirSync(DIR_NEW);
  }

  try {
    fs.writeFileSync(
      // `./uploads/user/${folder}/${fileName}`,
      // `${DIR_NEW}/${fileName}`,
      `${DIR_NEW}${fileName}`,
      imageBuffer,
      "utf8"
    );
    res.files = [
      {
        originalname: fileName,
        mimetype: "image/jpeg",
        // "destination": `${DIR_NEW}/`,
        // "filename": `${DIR_NEW}/${fileName}`,
        // "path": `${DIR_NEW}/${fileName}`,
        destination: `${DIR_NEW}`,
        filename: `${DIR_NEW}${fileName}`,
        path: `${DIR_NEW}${fileName}`,
      },
    ];

    console.log("uploadBase64Image success")
    //--- return res.send({ status: "success", fileName });
    next();
  } catch (e) {
    console.log("uploadBase64Image error>>>>", e)
    next(e);
  }
};

module.exports = {
  uploadImages,
  resizeImages,
  getResult,
  uploadMedias,
  moveMedias,
  getUploadResult,
  uploadBase64Image,
};
*/