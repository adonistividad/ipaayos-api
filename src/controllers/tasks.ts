import Permissions from "./../app/entities/Permissions";
import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import Tasks from "../app/entities/Tasks";
import config from "../config/config";
import RolesPermissionsController from "./roles_permissions";
import InitDB from "../database/model";
import { reject } from "lodash";
import db from "../dbConnection/mysql";
import { Op } from "sequelize";
import sequelize from "sequelize";

const path = require("path");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Importer = require("mysql-import");
const pug = require("pug");
const fs = require("fs");
const request = require("request");

export default class TasksRest extends BaseRepository<Tasks> {
  FetchTask = async (req: any, res: any) => {
    try {
      const { id, user_id, category, status } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }
      if (user_id) {
        condition = { ...condition, user_id };
      }
      if (category) {
        condition = { ...condition, category };
      }
      if (status) {
        condition = { ...condition, status };
      }

      console.log(
        "id, user_id, category, status >>>",
        id,
        user_id,
        category,
        status
      );

      this._db = req.db;

      this._db["tasks"].belongsTo(this._db["tasks_offers"], {
        foreignKey: "task_offer_id",
      });
      this._db["tasks_offers"].belongsTo(this._db["providers"], {
        foreignKey: "provider_id",
      });

      const task = await this.findOne(
        {
          // attributes: { exclude: ["password"] },
          where: condition,
          include: [
            {
              model: this._db["tasks_offers"],
              include: [{ model: this._db["providers"] }],
            },
          ],
        },
        "tasks"
      );

      if (task) {
        res.status(200).json({
          status: 200,
          msg: `Task details fetched successfully.`,
          task,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch task details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  FetchTasks = async (req: any, res: any) => {
    try {
      const {
        id,
        user_id,
        category,
        status,
        provider_id,
        with_offers = null,
      } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }
      if (user_id) {
        condition = { ...condition, user_id };
      }
      if (category) {
        condition = { ...condition, category };
      }
      if (status) {
        condition = { ...condition, status };
      }

      this._db = req.db;

      this._db["tasks"].hasMany(this._db["tasks_offers"], {
        foreignKey: "task_id",
      });

      this._db["tasks"].belongsTo(this._db["users"], {
        foreignKey: "user_id",
      });
      this._db["tasks_offers"].belongsTo(this._db["providers"], {
        foreignKey: "provider_id",
      });

      let condition_provider = {};
      if (provider_id) {
        condition_provider = { ...condition_provider, id: provider_id };
      }
      let joinFields = {};
      if (with_offers !== null) {
        // https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/
        // https://dataschool.com/how-to-teach-people-sql/sql-join-types-explained-visually/
        joinFields = { required: with_offers, right: with_offers };
      }
      let tasks: any = await this.findAllByCondition(
        {
          where: condition,
          include: [
            {
              model: this._db["users"],
              attributes: { exclude: ["email", "password", "social_login"] },
            },
            {
              model: this._db["tasks_offers"],
              include: [
                { model: this._db["providers"], where: condition_provider },
              ],
              ...joinFields,
            },
          ],
          order: [["task_datetime", "DESC"]],
        },
        "tasks"
      );
      if (with_offers !== null && !with_offers) {
        tasks = tasks?.filter(
          (task: any) =>
            task?.tasks_offers?.length === 0 ||
            (task?.tasks_offers?.length > 0 &&
              task?.tasks_offers?.filter(
                (t: any) => t.provider_id != provider_id
              )?.length > 0)
        );
      }

      if (tasks) {
        res.status(200).json({
          status: 200,
          msg: `Task details fetched successfully.`,
          tasks,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch task details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  UpdateTask = async (req: any, res: any) => {
    try {
      // const { email } = req.body;
      const { id = 0 } = req.body;
      // console.log(" req.body>>>>", req.body);
      this._db = req.db;

      const result = await this.updateOrCreate(req.body, "tasks", {
        where: { id },
      });

      if (result) {
        const { id } = result.item;
        return res.status(200).json({
          status: 200,
          id,
          msg: `Task has been ${id ? "created" : "updated"} succesfully.`,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch task details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  FetchTaskOffer = async (req: any, res: any) => {
    try {
      const { id, user_id, category, status } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }
      if (user_id) {
        condition = { ...condition, user_id };
      }
      if (category) {
        condition = { ...condition, category };
      }
      if (status) {
        condition = { ...condition, status };
      }

      console.log(
        "id, user_id, category, status >>>",
        id,
        user_id,
        category,
        status
      );

      this._db = req.db;

      // this._db["users"].hasMany(this._db["users_profile"], { foreignKey: "user_id" });
      // this._db["users"].hasMany(this._db["providers_profile"], { foreignKey: "user_id" });

      const task = await this.findOne(
        {
          // attributes: { exclude: ["password"] },
          where: condition,
          // include: [
          //   { model: this._db["users_profile"] },
          //   { model: this._db["providers_profile"] },
          // ],
        },
        "tasks_offers"
      );

      if (task) {
        res.status(200).json({
          status: 200,
          msg: `Task details fetched successfully.`,
          task,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch task details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  FetchTasksOffers = async (req: any, res: any) => {
    try {
      const { id, task_id, provider_id, status, offer_status } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }
      if (task_id) {
        condition = { ...condition, task_id };
      }
      if (provider_id) {
        condition = { ...condition, provider_id };
      }
      if (status) {
        condition = { ...condition, status };
      }
      if (offer_status) {
        condition = { ...condition, offer_status };
      }

      console.log(
        "id, task_id, provider_id, status, offer_status >>>",
        id,
        task_id,
        provider_id,
        status,
        offer_status
      );

      this._db = req.db;

      // this._db["tasks_offers"].hasOne(this._db["providers_profile"], {
      this._db["tasks_offers"].hasOne(this._db["providers"], {
        foreignKey: "id",
      });
      // this._db["tasks_offers"].hasMany(this._db["providers_profile"], { foreignKey: "id", as:"provider" });

      const tasks = await this.findAllByCondition(
        {
          where: condition,
          include: [
            // { model: this._db["providers_profile"], as:"provider" },
            { model: this._db["providers"] },
          ],
        },
        "tasks_offers"
      );

      if (tasks) {
        res.status(200).json({
          status: 200,
          msg: `Task offer details fetched successfully.`,
          tasks,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch task offer details.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  UpdateTasksOffer = async (req: any, res: any) => {
    try {
      const { id = 0, task_id } = req.body;
      this._db = req.db;

      const result = await this.updateOrCreate(req.body, "tasks_offers", {
        where: { id },
      });

      if (result) {
        const { id } = result.item;

        // //-- update tasks fields:  offers | shortlisted | declined
        if (task_id > 0) {
          const tasks_offers = await this.findAllByCondition(
            { where: { task_id } },
            "tasks_offers"
          );
          if (tasks_offers) {
            let offers = 0,
              shortlisted = 0,
              declined = 0;
            offers = tasks_offers.length;
            if (tasks_offers.length > 0) {
              shortlisted = tasks_offers.filter(
                (t: any) => t.offer_status === "shortlisted"
              ).length;
              declined = tasks_offers.filter(
                (t: any) => t.offer_status === "declined"
              ).length;
            }
            await this.update(
              task_id,
              { offers, shortlisted, declined },
              "tasks"
            );
          }
        }

        return res.status(200).json({
          status: 200,
          id,
          msg: `Task offer has been ${id ? "created" : "updated"} succesfully.`,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch task offer details.",
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
