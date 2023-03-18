import User from "../app/entities/Users";
import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import config from "../config/config";
import InitDB from "../database/model";
import mysql from "../dbConnection/mysql";

let db = mysql.ConnectToDB();

export default class ConnectDB extends BaseRepository<User> {
  ConnectToDB = async (req: any, res: any, next: any) => {
    try {
      let orgName = req.headers["org"] || req.body.orgName || req.body.org;
      // console.log("orgName>>>", orgName);
      if (orgName !== null && orgName !== "" && orgName !== undefined) {
        //CHECK IF ORG DB EXISTS OR NOT
        config.mysql.databaseName = orgName;
        console.log(">>>>>ORG", typeof (await db).conn[orgName]?.status);
        if (typeof (await db).conn[orgName]?.status !== "undefined") {
          // NO RELATED DB FOUND
          return res.status(200).send({
            status: 500,
            auth: false,
            msg:
              "Sorry we are unable to connect with your provided details at the moment. Please reach out to Ipaayos support at support@ipaayos.com",
          });
        } else if (typeof (await db).conn[orgName] !== "undefined") {
          this._db = (await db).conn[orgName];
        } else {
          db = mysql.ConnectToDB();
          this._db = (await db).conn[orgName];
        }

        if (this._db !== null) {
          //ORG DB EXISTS
          console.log("I AM HERE IN ORG DB ++++");
          req.db = this._db;
        } else {
          console.log("I AM HERE ++++");
          // this._db = (await db).conn["taskagram_db"];
          this._db = (await db).conn[config.mysql.databaseName];
          req.db = this._db;
        }

        req.org_name = orgName;
        req.dbConn = db;
        next();
      } else {
        // this._db = (await db).conn["taskagram_db"];
        this._db = (await db).conn[config.mysql.databaseName];

        req.db = this._db;
        req.dbConn = db;

        next();
      }
    } catch (err) {
      return res.status(200).json({
        status: 500,
        msg: `Something went wrong while connecting to DB.${err}`,
      });
    }
  };
}
