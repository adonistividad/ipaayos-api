import User from "../app/entities/Users";
import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import config from "../config/config";
import InitDB from "../database/model";

const jwt = require('jsonwebtoken');

export default class OrgMiddleware extends BaseRepository<User> {
    
    VerifyOrg = async (req: any, res: any, next: any) => {
      try {
        let token = req.headers['token'];
        let orgName = req.headers['org'];
        console.log(token);
        console.log(orgName);
        if(token !== null && orgName !== null) {
            jwt.verify(token, config.passphrase, async (err: any, decoded: any) => {
                if (err) return res.status(500).send({ auth: false, msg: 'Failed to authenticate the provided token.'});

                // CHECK ORG DB EXIST
                ////--config.mysql.databaseName = 'taskagram_db';
                this._db = req.db;

                console.log("here >>>>>>>>>>>>>>>>")
                const org: any = await this.findOne({where: { org_name: orgName }}, 'org_db');
                if(org) {
                    //CONNECT TO ORG DB
                    config.mysql.databaseName = orgName;
                    this._db = req.db;

                    const result = await this.findOne({where: {email: decoded.result.email}}, 'org_members');

                    if(result !== null) {
                        const orgDetails: any = await this.findAll('org_details');

                        if(orgDetails.length > 0) {
                            // req.user_email = decoded.result.email;
                            // req.db = this._db;
                            req.org_id = orgDetails[0].id;
                            next();
                        } else {
                            res.status(200).json({
                                status: 500,
                                domain: false,
                                msg: 'Unable to find valid organization details.'
                            });
                        }
                    } else {
                        return res.status(200).send({ status: 500, auth: false, msg: 'Failed to authenticate the provided token.'});
                    }                    
                } else {
                    return res.status(200).json({
                        status: 500,
                        userExist: false,
                        msg: 'Failed to authenticate Organization.'
                    });
                }
            });
        } else {
            return res.status(500).send({ status: 500, auth: false, msg: 'No token provided.'});
        }
      } catch(err) {
        res.status(500).json({msg: 'Something went wrong while verifying Token.'});
      }
    }
}