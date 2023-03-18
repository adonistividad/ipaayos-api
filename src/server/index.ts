import config from "../config/config";
import app from "./expressApp";
import "./routes";
//////////// import "./chatServer";

let server: any = null;

if (config.env.toLowerCase() === "development") {
  server = require("http").Server(app);
} else if (config.env.toLowerCase() === "stagging") {
  // FOR STAGGING

  const fs = require("fs");
  // Certificate
  const privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/jegerglad.work/privkey.pem",
    "utf8"
  );
  const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/jegerglad.work/cert.pem",
    "utf8"
  );
  const ca = fs.readFileSync(
    "/etc/letsencrypt/live/jegerglad.work/chain.pem",
    "utf8"
  );

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
  };

  server = require("https").createServer(credentials, app);
} else {
  // FOR PRODUCTION

  const fs = require("fs");
  // // Certificate
  const privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/api.taskagram.com/privkey.pem",
    "utf8"
  );
  const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/api.taskagram.com/cert.pem",
    "utf8"
  );
  const ca = fs.readFileSync(
    "/etc/letsencrypt/live/api.taskagram.com/chain.pem",
    "utf8"
  );

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
  };

  server = require("https").createServer(credentials, app);
}

export default server;
