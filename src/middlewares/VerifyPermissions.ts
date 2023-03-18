import RolesPermissions from "../app/entities/RolesPermissions";
import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import config from "../config/config";
import InitDB from "../database/model";

export default class VerifyPermissions extends BaseRepository<RolesPermissions> {
    VerifyPermissions = async (req: any, res: any, next: any) => {
        try {
            let { email, orgName, reqPermObj } = req.body;
            config.mysql.databaseName = orgName;

            this._db = req.db;

            let permResults: any = await this.findOne({
                where: { email }
            }, 'org_roles_permission');
            
            if(permResults) {
                reqPermObj = JSON.parse(reqPermObj);
                let permissions = JSON.parse(permResults.permissions);
                console.log(reqPermObj);
                permissions.forEach((prm: any) => {
                    console.log(reqPermObj["mod"], prm["module"]);
                    console.log(prm.perms[reqPermObj.mult_accnt],  prm.perms[reqPermObj.mult_org], prm.perms[reqPermObj.req]);
                    if(reqPermObj["mod"] == prm["module"]
                        && prm.perms[reqPermObj.req]
                        && prm.perms[reqPermObj.mult_accnt]
                        && prm.perms[reqPermObj.mult_org]) {
                            req.isAllowed = true;
                            next();
                    } else {
                        req.isAllowed = false;
                        return res.status(403).json({
                            status: 403,
                            auth: false,
                            isAllowed: false,
                            msg: `You do not have sufficient permissions to perform this request.`
                        });
                    }
                });
            } else {
                return res.status(500).json({status: 500, auth: false, msg: `Something went wrong, No valid permissions found for provided user.`});
            }

        } catch(err) {
            return res.status(500).json({status: 500, msg: `Something went wrong while processing your request. ${err}`});
        }
    }
}