import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import Notifications from "../app/entities/Notifications";
import sequelize from "sequelize";

export default class NotificationsRest extends BaseRepository<Notifications> {
  FetchNotification = async (req: any, res: any) => {
    try {
      const { id, user_id, provider_id, recipient } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }

      if (user_id) {
        condition = { ...condition, user_id };
      }
      if (provider_id) {
        condition = { ...condition, provider_id };
      }
      if (recipient) {
        condition = { ...condition, recipient };
      }

      console.log(
        "id, user_id, provider_id, recipient >>>",
        id,
        user_id,
        provider_id,
        recipient
      );

      this._db = req.db;

      this._db["notifications"].belongsTo(this._db["users"], {
        foreignKey: "user_id",
      });
      this._db["notifications"].belongsTo(this._db["providers"], {
        foreignKey: "provider_id",
      });

      const notification = await this.findOne(
        {
          // attributes: { exclude: ["password"] },
          where: condition,
          include: [
            {
              model: this._db["users"],
              attributes: { exclude: ["email", "password", "social_login"] },
            },
            {
              model: this._db["providers"],
              attributes: { exclude: ["email", "password", "social_login"] },
            },
          ],
        },
        "notifications"
      );

      if (notification) {
        res.status(200).json({
          status: 200,
          msg: `Notification details fetched successfully.`,
          notification,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch notification details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  FetchNotifications = async (req: any, res: any) => {
    try {
      const { id, user_id, provider_id, recipient } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }

      if (user_id) {
        condition = { ...condition, user_id };
      }
      if (provider_id) {
        condition = { ...condition, provider_id };
      }
      if (recipient) {
        condition = { ...condition, recipient };
      }

      this._db = req.db;

      this._db["notifications"].belongsTo(this._db["users"], {
        foreignKey: "user_id",
      });
      this._db["notifications"].belongsTo(this._db["providers"], {
        foreignKey: "provider_id",
      });

      const notifications = await this.findAllByCondition(
        {
          where: condition,
          include: [
            {
              model: this._db["users"],
              attributes: { exclude: ["email", "password", "social_login"] },
            },
            {
              model: this._db["providers"],
              attributes: { exclude: ["email", "password", "social_login"] },
            },
          ],
        },
        "notifications"
      );

      if (notifications) {
        res.status(200).json({
          status: 200,
          msg: `Notification details fetched successfully.`,
          notifications,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch notification details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };

  FetchGroupedNotifications = async (req: any, res: any) => {
    try {
      const { id, user_id, provider_id, recipient } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }

      if (user_id) {
        condition = { ...condition, user_id };
      }
      if (provider_id) {
        condition = { ...condition, provider_id };
      }
      if (recipient) {
        condition = { ...condition, recipient };
      }

      this._db = req.db;

      this._db["notifications"].belongsTo(this._db["users"], {
        foreignKey: "user_id",
      });
      this._db["notifications"].belongsTo(this._db["providers"], {
        foreignKey: "provider_id",
      });

      const notifications = await this.findAllByCondition(
        {
          attributes: [
            "id",
            "user_id",
            "provider_id",
            "recipient",
            "url_param",
            "status",
            "ts",
            [
              sequelize.fn("MAX", sequelize.col("notification")),
              "notification",
            ],
          ],
          where: condition,
          include: [
            {
              model: this._db["users"],
              attributes: { exclude: ["email", "password", "social_login"] },
            },
            {
              model: this._db["providers"],
              attributes: { exclude: ["email", "password", "social_login"] },
            },
          ],
          group: ["user_id", "provider_id"],
          order: [["ts", "DESC"]],
        },
        "notifications"
      );

      if (notifications) {
        res.status(200).json({
          status: 200,
          msg: `Notification details fetched successfully.`,
          notifications,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch notification details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  UpdateNotification = async (req: any, res: any) => {
    try {
      // const { email } = req.body;
      const {
        id = 0,
        user_id,
        provider_id,
        message,
        recipient,
        status,
      } = req.body;
      // console.log(" req.body>>>>", req.body);
      this._db = req.db;

      let condition = {};

      //-- overwrite record if status is not equal to seen
      if (status) {
        console.log("new record>>>>");
        condition = { ...condition, id };
      } else {
        req.body.ts = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        condition = {
          user_id,
          provider_id,
          message,
          recipient,
          status: "active",
        };
      }

      const result = await this.updateOrCreate(req.body, "notifications", {
        where: condition,
      });

      if (result) {
        const { id } = result.item;
        return res.status(200).json({
          status: 200,
          id,
          msg: `Notification has been ${
            id ? "created" : "updated"
          } succesfully.`,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch notification details.",
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
