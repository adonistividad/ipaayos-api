import User from "../app/entities/Users";
// import UsersProfile from "../app/entities/UsersProfile";
import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import config from "../config/config";
import mysql from "../dbConnection/mysql";

const jwt = require('jsonwebtoken');
let db = mysql.ConnectToDB();

export default class AuthenticateUser extends BaseRepository<User> {
    VerifyAuthToken = async (req: any, res: any, next: any) => {
      try {
        let token = req.headers['token'];
        let orgName = req.headers['org'];
        console.log(token);
        console.log(orgName);
        if(token !== null && orgName !== null) {
            jwt.verify(token, config.passphrase, async (err: any, decoded: any) => {
                if (err) return res.status(500).send({ status: 500, auth: false, msg: 'Failed to authenticate the provided token.'});
                // CONNECT TO DB
                console.log('>>>>>> CONNECTIONS',((await db).conn));
                this._db = (await db).conn["ipaayos_db"];
                const result = await this.findOne({where: {email: decoded.result.email}}, 'users');
                this._db = (await db).conn["ipaayos_db"];
                const org: any = await this.findOne({where: { org_name: orgName }}, 'org_db');
                console.log('>>>>>>USERS', result);
                console.log('>>>>>>ORGS', org)
                if(result !== null) {
                    // ITS A PRIMARY ADMIN USER
                    //CHECK IF ORG DB EXISTS OR NOT
                    console.log('>>>>>> I AM IN ORG');
                    if(org !== null && orgName !== '') {
                        this._db = null;
                        console.log('>>>>> I AM HERE IN UNDEFINED ORG', typeof (await db).conn[orgName])
                        if(typeof ((await db).conn[orgName]?.status) !== "undefined") {
                            // NO RELATED DB FOUND
                            return res.status(200).send({ status: 500, auth: false, msg: 'Sorry we are unable to connect with your provided details at the moment. Please reach out to Ipaayos support at support@ipaayos.com'});
                        } else if(typeof (await db).conn[orgName] !== "undefined") {
                            this._db = (await db).conn[orgName];
                        } else {
                            console.log('>>>>> I AM HERE IN NEW ORG DB', orgName)
                            db = mysql.ConnectToDB();
                            this._db = (await db).conn[orgName];
                        }
                        
                        // OLD QUERY this._db = (await db).conn.filter(org => org.orgName === orgName)[0].dbConn;
                        req.db = this._db;
                        req.org_name = orgName;
                    } else {
                        this._db = null;
                        this._db = (await db).conn["ipaayos_db"];
                        req.db = this._db;
                    }
                    req.user_email = decoded.result.email;
                    req.user_type = 'primary_admin';
                    req.dbConn = db;
                    
                    next();
                } else {
                    this._db = null;
                    //CHECK IF ORG DB EXISTS OR NOT
                    if(org !== null && orgName !== '') {
                        if(typeof (await db).conn[orgName] !== "undefined") {
                            this._db = (await db).conn[orgName];
                        } else {
                            console.log('>>>>> I AM HERE IN NEW ORG DB', orgName)
                            db = mysql.ConnectToDB();
                            this._db = (await db).conn[orgName];
                        }
                        req.user_type = 'org_member';
                        req.org_name = orgName;
                    } else {
                        this._db = (await db).conn["ipaayos_db"];
                        req.user_type = 'primary_user';
                    }
                    // NOW CHECK FOR USER IN MAIN DB
                    req.db = this._db;
                    req.user_email = decoded.result.email;
                    req.user_type = 'primary_user';
                    req.org_name = orgName;
                    req.dbConn = db;
                    next();
                }          
            });
        } else {
            return res.status(500).send({ status: 500, auth: false, msg: 'Oops! No Authentication token provided.'});
        }
      } catch(err) {
        return res.status(500).json({ status: 500, msg: `Something went wrong while verifying Token.${err}`});
      }
    }
}