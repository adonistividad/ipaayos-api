import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import Reviews from "../app/entities/Reviews";
import { Op } from "sequelize";

export default class ReviewsRest extends BaseRepository<Reviews> {
  FetchReview = async (req: any, res: any) => {
    try {
      const { id, task_id, user_id, status } = req.body;

      let condition = {};
      if (id) { condition = { ...condition, id }; }
      if (task_id) { condition = { ...condition, task_id }; }
      if (user_id) { condition = { ...condition, user_id }; }
      if (status) { condition = { ...condition, status }; }

      this._db = req.db;

      // this._db["users"].hasMany(this._db["users_profile"], { foreignKey: "user_id" });
      // this._db["users"].hasMany(this._db["providers_profile"], { foreignKey: "user_id" });

      const review = await this.findOne(
        {
          // attributes: { exclude: ["password"] },
          where: condition,
          // include: [
          //   { model: this._db["users_profile"] },
          //   { model: this._db["providers_profile"] },
          // ],
        },
        "reviews"
      );

      if (review) {
        res.status(200).json({
          status: 200,
          msg: `Review details fetched successfully.`,
          review,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch review details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };

  FetchReviews = async (req: any, res: any) => {
    try {
      const { id, task_id, user_id, status } = req.body;

      let condition = {};
      if (id) { condition = { ...condition, id }; }
      if (task_id) { condition = { ...condition, task_id }; }
      if (user_id) { condition = { ...condition, user_id }; }
      if (status) { condition = { ...condition, status }; }
      else { condition = { ...condition, status: { [Op.ne]: 'deleted' }  }; }

      this._db = req.db;

      // this._db["users"].hasMany(this._db["reviews"], { foreignKey: "user_id" });
      // this._db["users"].hasMany(this._db["providers_profile"], { foreignKey: "user_id" });
      this._db["reviews"].belongsTo(this._db["users"], { foreignKey: "user_id" });

      const reviews = await this.findAllByCondition(
        {
          // attributes: { exclude: ["password"] },
          where: condition,
          include: [
            { model: this._db["users"] },
            // { model: this._db["providers_profile"] },
          ],
        },
        "reviews"
      );

      if (reviews) {
        res.status(200).json({
          status: 200,
          msg: `Review details fetched successfully.`,
          reviews,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch reviews.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };

  UpdateReview = async (req: any, res: any) => {
    try {
      // const { email } = req.body;
      const { id = 0 } = req.body;
      console.log(" req.body>>>>", req.body);
      this._db = req.db;

      const result = await this.updateOrCreate(
        req.body,
        "reviews",
        {
          where: { id },
        },
      );

      if (result) {
        const { id } = result.item;
        return res.status(200).json({
          status: 200,
          id,
          msg: `Review has been ${id ? "created" : "updated"} succesfully.`
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to create or update review details.",
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
