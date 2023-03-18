import RolesPermissions from "./../app/entities/RolesPermissions";
import { BaseRepository } from "../app/repositories/Base/BaseReprository";

export default class RolesPermissionsController extends BaseRepository<RolesPermissions> {

    CreatePermissions = async (permsRequestObj: any, res: any) => {
        try {
            this._db = permsRequestObj.db;
            if(permsRequestObj.role) {
                let result:any = await this.create({
                    role: permsRequestObj.role,
                    permissions: JSON.stringify(permsRequestObj.permissions),
                    email: permsRequestObj.email,
                    status: permsRequestObj.status
                }, 'org_roles_permission');
                return {
                    status: 200,
                    id: result.id,
                    msg: 'Successfully create roles & permission for user.'
                }
            } else {
                return { status: 500, msg: 'Please add valid roles & permissions details for your team member.'};
            }
        } catch(err) {
            return {status: 500, msg: `Something went wrong while processing your request. ${err}`};
        }
    }

    FetchPermissions = async (req: any, res: any) => {
        try {
            this._db = req.db;
            if(req.body.email) {
                let perms:any = await this.findAllByCondition({
                    where: { email: req.body.email }
                }, 'org_roles_permission');
                if(perms.length > 0) {
                    return res.status(200).json({
                        status: 200,
                        msg: 'Successfully fetched roles & permission for user.',
                        permissions: perms
                    });
                } else {
                    return res.status(200).json({
                        status: 500,
                        msg: 'No related roles & permission found for the user',
                        permissions: []
                    });
                }
                
            } else {
                return res.status(200).json({ status: 500, msg: 'Please add valid details for roles & permissions details.'});
            }
        } catch(err) {
            return res.status(500).json({status: 500, msg: `Something went wrong while processing your request. ${err}`});
        }
    }
}