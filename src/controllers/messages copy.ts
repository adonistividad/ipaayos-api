import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import Messages from "../app/entities/Messages";
import sequelize from "sequelize";

export default class MessagesRest extends BaseRepository<Messages> {
  FetchMessage = async (req: any, res: any) => {
    try {
      const { id, task_id, user_id, provider_id, sender } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }
      if (task_id) {
        condition = { ...condition, task_id };
      }
      if (user_id) {
        condition = { ...condition, user_id };
      }
      if (provider_id) {
        condition = { ...condition, provider_id };
      }
      if (sender) {
        condition = { ...condition, sender };
      }

      console.log(
        "id, task_id, user_id, provider_id, sender >>>",
        id,
        task_id,
        user_id,
        provider_id,
        sender
      );

      this._db = req.db;

      this._db["messages"].belongsTo(this._db["users"], {
        foreignKey: "user_id",
      });
      this._db["messages"].belongsTo(this._db["providers"], {
        foreignKey: "provider_id",
      });

      const message = await this.findOne(
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
        "messages"
      );

      if (message) {
        res.status(200).json({
          status: 200,
          msg: `Message details fetched successfully.`,
          message,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch message details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  FetchMessages = async (req: any, res: any) => {
    try {
      const { id, task_id, user_id, provider_id, sender } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }
      if (task_id) {
        condition = { ...condition, task_id };
      }
      if (user_id) {
        condition = { ...condition, user_id };
      }
      if (provider_id) {
        condition = { ...condition, provider_id };
      }
      if (sender) {
        condition = { ...condition, sender };
      }

      this._db = req.db;

      this._db["messages"].belongsTo(this._db["users"], {
        foreignKey: "user_id",
      });
      this._db["messages"].belongsTo(this._db["providers"], {
        foreignKey: "provider_id",
      });

      const messages = await this.findAllByCondition(
        {
          where: condition,
        },
        "messages"
      );

      if (messages) {
        res.status(200).json({
          status: 200,
          msg: `Message details fetched successfully.`,
          messages,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch message details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };

  FetchGroupedMessages = async (req: any, res: any) => {
    try {
      const { id, task_id, user_id, provider_id, sender } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }
      if (task_id) {
        condition = { ...condition, task_id };
      }
      if (user_id) {
        condition = { ...condition, user_id };
      }
      if (provider_id) {
        condition = { ...condition, provider_id };
      }
      if (sender) {
        condition = { ...condition, sender };
      }

      this._db = req.db;

      this._db["messages"].belongsTo(this._db["users"], {
        foreignKey: "user_id",
      });
      this._db["messages"].belongsTo(this._db["providers"], {
        foreignKey: "provider_id",
      });

      const messages = await this.findAllByCondition(
        {
          attributes: [
            "id",
            "user_id",
            "provider_id",
            "task_id",
            "sender",
            "status",
            "ts",
            [sequelize.fn("MAX", sequelize.col("message")), "message"],
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
        "messages"
      );

      if (messages) {
        res.status(200).json({
          status: 200,
          msg: `Message details fetched successfully.`,
          messages,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch message details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  UpdateMessage = async (req: any, res: any) => {
    try {
      // const { email } = req.body;
      const { id = 0 } = req.body;
      // console.log(" req.body>>>>", req.body);
      this._db = req.db;

      const result = await this.updateOrCreate(req.body, "messages", {
        where: { id },
      });

      if (result) {
        const { id } = result.item;
        return res.status(200).json({
          status: 200,
          id,
          msg: `Message has been ${id ? "created" : "updated"} succesfully.`,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch message details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  
  UpdateMessages = async (req: any, res: any) => {
    try { 
      const { user_id, provider_id, sender, task_id, status } = req.body;
      // console.log(" req.body>>>>", req.body);
      this._db = req.db;
      let condition = {};
      if (user_id) {condition = { ...condition, user_id };}
      if (provider_id) {condition = { ...condition, provider_id };}
      if (sender) {condition = { ...condition, sender };}
      if (task_id) {condition = { ...condition, task_id };}
      const result = await this.updateByCondition(
        { where: condition },
        { status },
        "messages"
      );
 

      if (result) { 
        return res.status(200).json({
          status: 200, 
          msg: "Messages has been updated succesfully.",
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to update messages.",
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
