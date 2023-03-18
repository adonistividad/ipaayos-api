// Connect to all the databases here.

import User from "../app/entities/Users";
import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import config from "../config/config";
import InitDB from "../database/model";
import fs from 'fs';
import path from 'path';
import * as sequel from 'sequelize';
const basename = path.basename(__filename);

export class ConnectDB extends BaseRepository<User> {
    sequelize: any = null;
    db: any = {};
    connected: boolean = false;

    /*********
    ConnectToDB = async () => {
        let orgConnArr: any = {};
        // CONNECT TO TASKAGRAM DB TO GET OTHER DB NAME
        config.mysql.databaseName = 'taskagram_db';
        let dbConn = new InitDB();
        let dbRsp = await dbConn.connectDB(config.mysql);
        this._db = dbRsp;

        this.db["taskagram_db"] = dbRsp;
        const orgDB = await this.findAll('org_db');

        if(orgDB && orgDB.length > 0) {
            for(let i = 0; i < orgDB.length; i++) {
                let name: any = orgDB[i];
                console.log('>>>>>>',name.org_name);
                config.mysql.databaseName = name.org_name;
                await this.initSequelize(config.mysql, name.org_name);
            };
            console.log('>>>>>CONNECTED DBS', this.db);
            return {
                status: 200,
                msg: "Org DB Connection established successfully.",
                conn: this.db
            }
        } else {
            return {
                status: 200,
                msg: "Oops, No orgizations found so switching to main db connection",
                conn: orgConnArr
            }
        }
    }
 */
   
    ConnectToDB = async () => {
        console.log('config.mysql.databaseName>>>>>', config.mysql.databaseName)
        await this.initSequelize(config.mysql, config.mysql.databaseName);
        return {
          status: 200,
          msg: "Org DB Connection established successfully.",
          conn: this.db,
        };
      };
    
    private initSequelize = async (mysqlConfig: any, orgName: any) => {
        try {
            let sequelize = new sequel.Sequelize(
            mysqlConfig.databaseName,
            mysqlConfig.username,
            mysqlConfig.password,
            {
                host: mysqlConfig.host,
                dialect: mysqlConfig.dialect,
                timezone: mysqlConfig.timezone,
                operatorsAliases: mysqlConfig.operatorsAliases,
                define: {
                timestamps: false // true by default
                },
                logging: false,
                pool: {
                    max: 5,
                    min: 0,
                    idle: 1200000,
                    acquire: 1200000,
                    evict: 1200000
                },
            },
            );
        
            await sequelize.authenticate();
            
            return this.dbConnect(sequelize, orgName);
        } catch(err) {
            console.log('>>>>>DB AUTHENTICATION FAILED +++', err);
            return this.db[mysqlConfig.databaseName] = {
                status: 500,
                msg: "Oops, No db found related to provided orgizations.",
                err
            };
        }
    }

    private dbConnect = (sequelize: any, orgName: any) => {
        let db: any = {};
        fs.readdirSync(path.join(__dirname, '../database/model'))
            .filter(function(file) {
                return (
                    file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && !file.includes('index.js') 
                );
            })
            .forEach(function(file) {
                const model = sequelize['import'](path.join(__dirname, `../database/model/${file}`));
                db[model.name] = model;
            });

        Object.keys(db).forEach(modelName => {
            if (db[modelName].associate) {
                db[modelName].associate(db);
            }
        });

        db.sequelize = sequelize;
        db.Sequelize = sequel;
        this.db[orgName] = db;
        this.connected = true;
        return this.db;
    }
}

let db = new ConnectDB();

export default db;