import { Sequelize, Op } from "sequelize";

import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import CommonTables from "../app/entities/Categories";
import config from "../config/config";
import InitDB from "../database/model";

export default class CommonTablesController extends BaseRepository<
  CommonTables
> {
  FetchCategories = async (req: any, res: any) => {
    try {
      // this._db = new InitDB(config.mysql).db;
      
      // console.log(" req.db>>>>",  req.db)
      this._db = req.db;

      const results = await this.findAllByCondition(
        {
          where: { status: "active" },
        },
        "categories"
      );
      // console.log("categories>>>>", categories);

      if (results) {
        // categories.status = 200;
        // categories.msg = "Successfully found Album Profile Details.";
        // res.status(200).json(categories);
        res.status(200).json({
          status: 200,
          msg: `Categories fetched successfully.`,
          categories: results,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch categories.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
}
