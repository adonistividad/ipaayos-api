import fs from 'fs';
import path from 'path';
import * as sequel from 'sequelize';
const basename = path.basename(__filename);
//import config from '../../config/config';

//const mysqlConfig = config.mysql;

export default class InitDB {
  public sequelize: any = null;
  public db: any = {};
  public connected: boolean = false;

  public connectDB = (mysqlConfig: any) => {
    return this.initSequelize(mysqlConfig);
  }

  private initSequelize = (mysqlConfig: any) => {
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
    try {
      (async () => await sequelize.authenticate())();
      console.log('>>>>>DB AUTHENTICATED +++', mysqlConfig.databaseName);
      return this.dbConnect(sequelize, this.db);
    } catch(err) {
      console.log('>>>>>DB AUTHENTICATION FAILED +++', err);
      return err;
    }
  }

  private dbConnect = (sequelize: any, db: any) => {
    fs.readdirSync(__dirname)
      .filter(function(file) {
        return (
          file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
        );
      })
      .forEach(function(file) {
        const model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
      });

    Object.keys(db).forEach(modelName => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    db.sequelize = sequelize;
    db.Sequelize = sequel;
    this.db = db;
    this.connected = true;
    return this.db;
  }
}
