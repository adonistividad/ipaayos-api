import Permissions from "./../app/entities/Permissions";
import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import config from "../config/config";
import RolesPermissionsController from "./roles_permissions";
// import InitDB from "../database/model";
// import { reject } from "lodash";
// import db from "../dbConnection/mysql";
import { Op } from "sequelize";
//--- import StripeAPI from './stripe_api';
// import { resolve } from "path";
import Users from "../app/entities/Users";

const path = require("path");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Importer = require("mysql-import");
const pug = require("pug");
const fs = require("fs");
const request = require("request");
const mysql = require("mysql");

const util = require("util");
const read = util.promisify(fs.readFile);

var con = mysql.createPool({
  connectionLimit: 5,
  host: config.mysql.host,
  user: config.mysql.username,
  password: config.mysql.password,
  database: config.mysql.databaseName,
  port: config.mysql.port,
});

export default class UsersRest extends BaseRepository<Users> {
  GetClientIP = async (req: any) => {
    try {
      // let { email, org_name } = req.body;
      const parseIp = (req: any) =>
        req.headers["x-forwarded-for"]?.split(",").shift() ||
        req.socket?.remoteAddress;
      const geoip = require("geoip-lite");
      // var ip = "207.97.227.239";
      const ip_address = parseIp(req);
      const geo = geoip.lookup(ip_address);
      // console.log(parseIp(req), req.socket?.remoteAddress);
      console.log("geo>>>>", ip_address, geo);
      req.body.ip_address = ip_address;
    } catch (err) {
      req.result = {
        status: 500,
        msg: `Oops! Something went wrong while sending your OTP. ERR: ${err}`,
      };
    }
  };

  SignupUser = async (req: any, res: any, next: any = undefined) => {
    const { email } = req.body;
    try {
      if (email) {
        let DB_NAME = config.mysql.databaseName;
        this._db = req.db;

        const user: any = await this.findOne(
          {
            where: { email },
          },
          "users"
        );

        // console.log("user>>>>>>>>>>", user);
        if (user == null) {
          await this.GetClientIP(req);
          console.log("req.body.ip_address >>>>", req.body.ip_address);

          let prmReqObj: Permissions = new Permissions(email);
          // let rolesPermissions = new RolesPermissionsController(DB_NAME);
          let rolesPermissions = new RolesPermissionsController();
          let permissions: any = await rolesPermissions.CreatePermissions(
            prmReqObj,
            res
          );

          // GRAB THE ORG DB NAME & PERMISSION ID, FINALLY CREATE USER
          req.body.permission_id = permissions.id;
          req.body.team_status = "creator";
          req.body.status = "first_time";
          // req.body.ip_address = ip_address;

          // console.log("req.body>>>>>>>>>>", req.body);

          const result: any = await this.create(req.body, "users");
          // console.log("result>>>>>>>>>>", result.id);

          if (result) {
            await this.SendNewOTP(req, res);
            return res.status(200).json({
              status: 200,
              msg: "User signed up successfully",
              id: result.id,
              success: true,
            });
          } else {
            return res.status(200).json({
              status: 500,
              msg: "Error Creating User",
            });
          }
        } else {
          if (!user?.name) {
            return res.status(200).json({
              status: 201,
              msg: "User's full name and number pending",
              id: user?.id,
              success: true,
            });
          } else if (user?.email_status === "not_verified") {
            return res.status(200).json({
              status: 202,
              msg: "Email not verified yet.",
              id: user?.id,
              success: true,
            });
          } else if (
            req.body.user_name &&
            user.user_name === req.body.user_name
          ) {
            return res.status(200).json({
              status: 500,
              msg: "Username already exists!",
              auth: false,
              user_name: user.user_name,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
            });
          } else {
            return res.status(200).json({
              status: 500,
              msg: "Email already exists!",
              auth: false,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
            });
          }
        }
      } else {
        return res
          .status(200)
          .json({ status: 500, msg: "Please add user detail to signup." });
      }
    } catch (err) {
      return res.status(500).json({ msg: "Unable to Register User" });
    }
  };

  VerifyAccount = async (req: any, res: any) => {
    try {
      const { uveid } = req.body;

      if (uveid) {
        jwt.verify(uveid, config.passphrase, async (err: any, decoded: any) => {
          if (err)
            return res.status(200).json({
              status: 500,
              msg: "Incorrect user verification details or session expired.",
            });

          let id = decoded.result;
          this._db = req.db;
          const checkVerification = await this.findOne(
            {
              where: { id, email_status: "verified" },
            },
            "users"
          );

          if (!checkVerification) {
            const user = await this.updateByCondition(
              {
                where: { id },
              },
              { email_status: "verified" },
              "users"
            );
            if (user) {
              // res;
              return res.status(200).json({
                status: 200,
                verified: true,
                msg: "User account verified successfully",
              });
            } else {
              return res.status(200).json({
                status: 500,
                verified: false,
                msg:
                  "Something went wrong while verifying account please try again.",
              });
            }
          } else {
            return res.status(200).json({
              status: 403,
              verified: true,
              msg: "User already verified.",
            });
          }
        });
      } else {
        return res.status(200).json({
          status: 500,
          verified: false,
          msg: "Verification Decoded Failed",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Unable to Verify User Email." });
    }
  };

  SigninUser = async (req: any, res: any) => {
    try {
      let {
        email,
        password,
        userName,
        name,
        social_login = "",
        accessToken,
        imageUrl,
      } = req.body;
      this._db = req.db;

      if (email && (password || social_login)) {
        let user: any = null;
        if (social_login) {
          await this.GetClientIP(req);
          const dataSocial = {
            ...req.body,
            email_status: "verified",
            status: "active",
          };
          console.log("dataSocial ", dataSocial);
          await this.updateOrCreate(dataSocial, "users", {
            where: { email, social_login },
          });
        }

        user = await this.findOne(
          {
            where: { email, password, social_login },
          },
          "users"
        );

        if (user !== null) {
          // console.log("user?.ip_address ", user?.ip_address)
          // if(!user?.ip_address) {
          //   await this.GetClientIP(req);
          //   const ip_address=req.body.ip_address;
          //   try{
          //     await this.updateByCondition({ where: { email, social_login}, }, { ip_address: req.body.ip_address }, "users" );
          //   }catch(e){
          //     console.log(" e ", e)
          //   }

          // console.log(" >>> ip_address >>>", ip_address, email, social_login)
          // }

          if (!accessToken) {
            accessToken =
              "accessToken~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ";
          }
          if (!userName) {
            userName = user.user_name;
          }
          if (!name) {
            name = user.name;
          }
          if (!imageUrl) {
            imageUrl = user.photo;
          }
          let data: any = {
            status: 200,
            msg: social_login ? "" : "User Credentials Matched.",
            creds: true,
            id: user.id,
            userName,
            name,
            imageUrl,
            accessToken,
            session: user.session,
            user_action: user.status,
            email: user.email,
          };
          if (social_login === "google") {
            data = { ...data, isGoogle: true };
          }
          if (user?.email_status === "not_verified") {
            return res.status(200).json({
              status: 202,
              msg: "Email not verified yet.",
              id: user?.id,
            });
          } else {
            return res.status(200).json(data);
          }
        } else {
          return res.status(200).json({
            status: 500,
            creds: false,
            msg: `Invalid Credentials, Wrong Email or Password. Please try again.`,
          });
        }
      } else {
        return res
          .status(200)
          .json({ status: 500, msg: "Please add user detail to signin." });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ msg: `Something went wrong while logging in. ${err}` });
    }
  };

  SendNewOTP = async (req: any, res: any) => {
    try {
      let { email, org_name } = req.body;
      console.log("  email, org_name >>>", email, org_name);
      if (org_name) {
        org_name = org_name?.toLowerCase();
        config.mysql.databaseName = org_name;
      }
      this._db = req.db;
      // SEND AN OTP
      const otp: number = Math.ceil(Math.random() * 8000) + 1000;
      const otpFind: any = await this.findOne(
        { where: { email } },
        "otp_verification"
      );
      if (otpFind !== null) {
        const otp = await this.delete(otpFind.id, "otp_verification");
      }

      const otpDB: any = await this.create(
        { otp, email, status: "otp_sent" },
        "otp_verification"
      );

      // ****AFTER TOKEN SEND OTP FOR 2-STEP VERIFICATION****
      // create reusable transporter object using the default SMTP transport
      if (otpDB) {
        await Promise.all([
          read(path.join(__dirname, "../templates/emails/userOTP.pug"), "utf8"),
        ]).then(async (data: any) => {
          let fn = pug.compile(data);
          let emailTemp = fn({ otp });
          let transporter = nodemailer.createTransport(config.mail);

          // send mail with defined transport object
          let info = await transporter.sendMail({
            // from: '"Support" <support@ipaayos.com>', // sender address
            from: '"Support" <support@taskagram.com>', // sender address
            to: req.body.email, // list of receivers
            subject: "Ipaayos OTP For Account Verification", // Subject line
            text:
              "Please verify your account by using the below provided 4 digit OTP. If you didn't initiated this request please change your account password & don't share this OTP with anyone else.", // plain text body
            html: emailTemp, // html body
          });

          if (info) {
            console.log(" SendNewOTP>>>>>>>>>>", otp, info);
            req.result = {
              status: 200,
              msg: "OTP Sent Successfully.",
              otp: true,
              oid: otpDB.id,
              // org_name,
            };
          } else {
            console.log(
              "Failed to send an OTP. Please try again or reach support."
            );
            req.result = {
              status: 200,
              msg: "Failed to send an OTP. Please try again or reach support.",
              otp: false,
              oid: null,
              // org_name,
            };
          }
        });
      }
    } catch (err) {
      req.result = {
        status: 500,
        msg: `Oops! Something went wrong while sending your OTP. ERR: ${err}`,
      };
    }
  };

  SendOTP = async (req: any, res: any) => {
    try {
      // let { email, org_name } = req.body;
      await this.SendNewOTP(req, res);

      if (req?.result) {
        return res.status(200).json(req.result);
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to send OTP.",
        });
      }
    } catch (err) {
      res.status(200).json({
        status: 500,
        msg: `Oops! Something went wrong while sending your OTP. ERR: ${err}`,
      });
    }
  };

  CheckOTP = async (req: any, res: any) => {
    try {
      // let { otp, email, id, oid, org_name } = req.body;
      let { otp, email } = req.body;

      console.log("otp, email  >>>", otp, email);
      this._db = req.db;

      if (otp && email) {
        const otpResult = await this.findOne(
          { where: { otp, email } },
          "otp_verification"
        );

        if (otpResult !== null) {
          return {
            status: 200,
            msg: "OTP successfully validated.",
          };
          /********
          const otp = await this.delete(oid, "otp_verification");
          // CHECK ORG EXIST OR NOT
          ////// config.mysql.databaseName = org_name; 
          // this._db = req.db;
          // FIND CPANEL CREDS IF IT EXISTS
          const usercPDetails = await this.findAll("org_cpanel");

          const token = jwt.sign({ result: { id, email } }, config.passphrase, {
            expiresIn: "1h",
          });

          if (usercPDetails.length > 0) {
            let respObj: any = {
              status: 200,
              msg: "User Signedin Successfully",
              id: id,
              email,
              utk: token,
              auth: true,
              authcP: usercPDetails,
            };
            if (res !== null) {
              return res.status(200).json(respObj);
            } else {
              return respObj;
            }
          } else {
            let respObj: any = {
              status: 200,
              msg: "User Signedin Successfully",
              id,
              email,
              utk: token,
              auth: true,
              authcP: [],
            };

            if (res !== null) {
              return res.status(200).json(respObj);
            } else {
              return respObj;
            }
          }
          */
        } else {
          let respObj: any = {
            status: 500,
            msg: "Incorrect OTP please try again.",
          };

          if (res !== null) {
            return res.status(200).json(respObj);
          } else {
            return respObj;
          }
        }
      } else {
        let respObj: any = {
          status: 500,
          msg: "Please add otp detail for verification.",
        };
        if (res !== null) {
          return res.status(200).json(respObj);
        } else {
          return respObj;
        }
      }
    } catch (err) {
      console.log(err);
      let respObj: any = { msg: "Something went wrong while verifying OTP." };
      if (res !== null) {
        return res.status(500).json(respObj);
      } else {
        return respObj;
      }
    }
  };

  VerifyOTP = async (req: any, res: any) => {
    try {
      let { otp, email } = req.body;
      console.log("otp, email  >>>", otp, email)
      this._db = req.db;

      if (otp && email) {
        const otpResult: any = await this.findOne(
          { where: { otp, email } },
          "otp_verification"
        );
        if (otpResult) {
          const { id } = otpResult;
          await this.delete(id, "otp_verification");
          await this.updateByCondition(
            { where: { email } },
            { email_status: "verified" },
            "users"
          );
          const user: any = await this.findOne(
            {
              attributes: { exclude: ["email", "password", "social_login"] },
              where: { email },
            },
            "users"
          );
          return res.status(200).json({
            status: 200,
            user,
            msg: `OTP successfully validated.`,
          });
        } else {
          res.status(200).json({
            status: 500,
            msg: "Incorrect OTP please try again.",
          });
        }
      } else {
        res.status(200).json({
          status: 500,
          msg: "Please add otp detail for verification.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };

  ForgotPassword = async (req: any, res: any) => {
    try {
      let { email, org_name } = req.body;
      org_name = org_name.toLowerCase();
      if (email) {
        this._db = (await req.dbConn).conn["Ipaayos_db"];

        const org: any = await this.findOne(
          { where: { org_name: org_name } },
          "org_db"
        );

        if (org) {
          // CHECK ORG EXIST OR NOT
          this._db = (await req.dbConn).conn[org_name];

          const user: any = await this.findOne(
            { where: { email } },
            "org_members"
          );

          if (user || req.body.user) {
            const passResetReqExists = await this.findOne(
              {
                where: {
                  email,
                  status: "password_reset_initiated",
                },
              },
              "org_password_reset"
            );
            if (!passResetReqExists) {
              let prid = `JKHDUI${Math.ceil(
                Math.random() * 10000
              )}HKDSKJHOPI${Math.ceil(
                Math.random() * 10000
              )}IOPPKHJHKJ${Date.now()}`;
              console.log(prid, ">>>>>>>>", email);

              const passReset: any = await this.create(
                {
                  email:
                    req.body.company_email == null ||
                    req.body.company_email == undefined ||
                    req.body.company_email == ""
                      ? email
                      : req.body.company_email,
                  old_password: user ? user.password : null,
                  pass_reset_id: prid,
                  expiry_time: req.body.emailTemplateURL
                    ? req.body.emailTemplateURL.expiry_time
                    : 5,
                  status: "password_reset_initiated",
                },
                "org_password_reset"
              );
              if (passReset) {
                let templateURL = "../templates/emails/userResetPassword.pug";

                console.log(templateURL);

                fs.readFile(
                  path.join(__dirname, templateURL),
                  "utf8",
                  async (err: any, data: any) => {
                    if (err) throw err;

                    const encodeGetParams = (p: any) =>
                      Object.entries(p)
                        .map((kv: any) => kv.map(encodeURIComponent).join("="))
                        .join("&");

                    const params = {
                      _prid: prid,
                      _org: org_name,
                      _eml:
                        req.body.company_email == ""
                          ? email
                          : req.body.company_email,
                    };

                    let fn = pug.compile(data);
                    let emailTemp = fn({
                      url: `${config.baseURL}/password-reset?${encodeGetParams(
                        params
                      )}`,
                      org_name: req.body.org_name,
                      admin_email: req.body.email,
                      first_name: user.first_name,
                    });
                    let transporter = nodemailer.createTransport(config.mail);
                    // send mail with defined transport object
                    let info = await transporter.sendMail({
                      // from: '"Ipaayos Support" <support@ipaayos.com>', // sender address
                      from: '"Support" <support@taskagram.com>', // sender address
                      to: req.body.email, // list of receivers,
                      // bcc: "ahmed@meekd.work",
                      subject: "Ipaayos Account Password Reset", // Subject line
                      text:
                        "Please verify your account by using the below provided 4 digit OTP. If you didn't initiated this request please change your account password & don't share this OTP with anyone else.", // plain text body
                      html: emailTemp, // html body
                    });
                    let response = {
                      status: 200,
                      userExist: true,
                      passReset: passReset.id,
                      msg: "Password Reset Request Initiated Successfully.",
                    };
                    console.log(response);
                    if (req.body.noStatus) return response;
                    return res.status(200).json(response);
                  }
                );
              } else {
                let response = {
                  status: 500,
                  userExist: true,
                  passReset: null,
                  msg: "Could initiate password request procedure.",
                };
                console.log(response);
                if (req.body.noStatus) return response;

                return res.status(200).json(response);
              }
            } else {
              let response = {
                status: 500,
                userExist: true,
                passReset: null,
                msg:
                  "Password Reset Already Initiated. Please use the existing link sent to your email to reset your password.",
              };
              console.log(response);
              if (req.body.noStatus) return response;

              return res.status(200).json(response);
            }
          } else {
            let response = {
              status: 500,
              userExist: false,
              msg: "Could not find any user related to the provided email.",
            };
            console.log(response);
            if (req.body.noStatus) return response;

            return res.status(200).json(response);
          }
        } else {
          let response = {
            status: 500,
            userExist: false,
            msg: "Could not find any organization with provide name.",
          };
          console.log(response);
          if (req.body.noStatus) return response;

          return res.status(200).json(response);
        }
      } else {
        let response = {
          status: 500,
          msg: "Please add valid email for password reset.",
        };
        console.log(response);
        if (req.body.noStatus) return response;

        return res.status(200).json(response);
      }
    } catch (err) {
      let response = {
        status: 500,
        msg: `Something went wrong while process your request for password reset. ERR ${err}`,
      };
      console.log(response);
      if (req.body.noStatus) return response;

      return res.status(500).json(response);
    }
  };

  ResetPassword = async (req: any, res: any) => {
    try {
      let { email, org_name, password, prid } = req.body;
      org_name = org_name.toLowerCase();
      if (email && password) {
        // CHECK ORG DB EXIST
        this._db = (await req.dbConn).conn["Ipaayos_db"];

        const org: any = await this.findOne(
          { where: { org_name: org_name } },
          "org_db"
        );

        if (org) {
          //CONNECT TO ORG DB
          //config.mysql.databaseName = org_name;
          this._db = (await req.dbConn).conn[org_name];
          const userPassResetID: any = await this.findOne(
            { where: { email, pass_reset_id: prid } },
            "org_password_reset"
          );
          if (userPassResetID) {
            // CHECK THE DURATION OF PASSWORD WHICH IS 30 Mintues By Default.
            let timePassedHrs =
              new Date().getHours() - new Date(userPassResetID.ts).getHours();
            let timePassed =
              new Date().getMinutes() -
              new Date(userPassResetID.ts).getMinutes();

            if (
              timePassedHrs <= 0 &&
              timePassed <= userPassResetID.expiry_time
            ) {
              const user: any = await this.findAllByCondition(
                { where: { email } },
                "org_members"
              );
              let usedPasswords = [];
              if (user.length > 0) {
                user.forEach((usr: any) => {
                  if (usr.password == password) {
                    usedPasswords.push(usr);
                  }
                });
                if (usedPasswords.length <= 0) {
                  const updatePass = await this.update(
                    user[user.length - 1].id,
                    { password },
                    "org_members"
                  );
                  if (updatePass) {
                    const userPassResetUpdate: any = await this.update(
                      userPassResetID.id,
                      { status: "password_reset_done" },
                      "org_password_reset"
                    );
                    return res.status(200).json({
                      status: 200,
                      passReset: true,
                      timePassed,
                      msg:
                        "Password Reset Successfully Completed. You can now proceed to Signin.",
                    });
                  } else {
                    return res.status(200).json({
                      status: 500,
                      passReset: false,
                      timePassed,
                      msg:
                        "Invalid Password Request, Could not find any user related to the provided email.",
                    });
                  }
                } else {
                  return res.status(200).json({
                    status: 500,
                    passReset: false,
                    msg:
                      "The password you are trying to use is same as your previously use password. Please try again with new password.",
                  });
                }
              } else {
                return res.status(200).json({
                  status: 500,
                  passReset: false,
                  msg:
                    "Invalid Password Request, Could not find any user related to the provided email.",
                });
              }
            } else {
              const userPassResetUpdate: any = await this.update(
                userPassResetID.id,
                { status: "link_expired" },
                "org_password_reset"
              );
              return res.status(200).json({
                status: 500,
                passReset: false,
                timePassed,
                msg:
                  "Password Reset Link Expired. Please Try Resetting Your Password Again.",
              });
            }
          } else {
            return res.status(200).json({
              status: 500,
              passReset: false,
              msg: "Invalid Password Request.",
            });
          }
        } else {
          return res.status(200).json({
            status: 500,
            userExist: false,
            msg: "Could not find any related organization.",
          });
        }
      } else {
        return res.status(200).json({
          status: 500,
          msg: "Please add valid password for password reset.",
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: 500,
        msg: `Something went wrong while process your request for password reset. ERR: ${err}`,
      });
    }
  };

  CheckUserStatus = async (req: any, res: any) => {
    try {
      let { email } = req.body;

      if (email !== "") {
        this._db = req.db;

        const userStatus: any = await this.findOne(
          {
            where: { email },
          },
          "org_members"
        );

        if (userStatus) {
          res.status(200).json({
            status: 200,
            msg: "Successfully found valid user status.",
            emailStatus: userStatus.email_status,
            userStatus: userStatus.status,
          });
        } else {
          res.status(200).json({
            status: 500,
            msg:
              "Oops! Unable to find valid user status with provide credentials.",
            emailStatus: null,
            userStatus: null,
          });
        }
      } else {
        res.status(200).json({
          status: 500,
          msg: "Oops! Please provide a valid email address.",
        });
      }
    } catch (error) {
      res.status(200).json({
        status: 500,
        msg: "Oops! Something went wrong while checking verifying your status.",
      });
    }
  };

  AccountSettings = async (req: any, res: any) => {
    try {
      let { oldEmail, oldPassword, oid, otp } = req.body;

      this._db = req.db;

      if (oldEmail !== "" && oldPassword !== "") {
        const verifyUserCreds: any = await this.findAllByCondition(
          { where: { email: oldEmail, password: oldPassword } },
          "org_members"
        );

        if (verifyUserCreds.length > 0) {
          // USER IS VALID & HAS CORRECT CREDENTIALS
          // NOW VERIFY USER OTP
          req.body.oid = oid;
          req.body.id = verifyUserCreds.id;
          req.body.otp = otp;

          const checkOTP = await this.CheckOTP(req, null);

          if (checkOTP) {
            if (
              checkOTP.status === 200 &&
              checkOTP.utk !== "" &&
              checkOTP.authcP.length > 0
            ) {
              if (req.body.newEmail || req.body.newPassword) {
                const tables = [
                  "billing",
                  "billing_capture",
                  "org_compute_engine",
                  "org_cpanel",
                  "org_datacenter_locations",
                  "org_details",
                  "org_domain",
                  "org_invoices",
                  "org_members",
                  "org_members_profile",
                  "org_notifications",
                  "otp_verification",
                  "org_password_reset",
                  "org_products",
                  "org_roles_permission",
                  "org_term_service",
                  "org_support_tickets",
                ];

                for (let table of tables) {
                  console.log("table>>>", table);
                  let obj: any = {};
                  if (req.body.newEmail) {
                    obj.email = req.body.newEmail;
                  }
                  if (table === "org_members" && req.body.newPassword) {
                    obj.password = req.body.newPassword;
                  }
                  if (Object.keys(obj).length > 0) {
                    await this.updateByCondition(
                      { where: { email: oldEmail } },
                      obj,
                      table
                    );
                  }
                }

                // CONNECT TO NEW W1 MAIN DB
                this._db = (await req.dbConn).conn["Ipaayos_db"];

                for (let table of ["org_db", "users"]) {
                  let obj: any = {};
                  if (req.body.newEmail) {
                    obj.email = req.body.newEmail;
                  }
                  if (table === "users" && req.body.newPassword) {
                    obj.password = req.body.newPassword;
                  }
                  if (Object.keys(obj).length > 0) {
                    await this.updateByCondition(
                      { where: { email: oldEmail } },
                      obj,
                      table
                    );
                  }
                }

                return res.status(200).json({
                  status: 200,
                  msg: "Successfully updated your account settings.",
                  account: checkOTP,
                });
              } else {
                return res.status(200).json({
                  status: 200,
                  msg: "No account details provided to be updated.",
                  account: null,
                });
              }
            } else {
              return res.status(200).json(checkOTP);
            }
          } else {
            return res.status(200).json({
              status: 500,
              msg: "Something went wrong while verifying your OTP.",
            });
          }
        } else {
          return res.status(200).json({
            status: 200,
            msg:
              "Oops! Your provided credentials didn't match with your current account details.",
          });
        }
      } else {
        res.status(200).json({
          status: 500,
          msg: "Please provide vaild account settings to be updated.",
        });
      }
    } catch (err) {
      res.status(200).json({
        status: 500,
        msg: `Oops! Something went wrong while updating your account settings. ERR: ${err}`,
      });
    }
  };

  AuthenticateUser = async (req: any, res: any) => {
    // AUTHENTICATE ME
    try {
      this._db = req.db;

      if (req.user_email !== "" && req.org_name !== "") {
        res.status(200).json({
          status: 200,
          msg: "Authenticated User",
          auth: true,
        });
      } else {
        res.status(500).json({
          status: 500,
          msg: "Not Authenticated User",
          auth: false,
        });
      }
    } catch (err) {
      res.status(200).json({
        status: 500,
        msg: "The user is not authenticated.",
        auth: false,
      });
    }
  };

  EmailTestingAPI = async (req: any, res: any) => {
    try {
      request.get(
        "https://ipaayos.com/emails/templates/billing.html",
        async function(err: any, resp: any, billing: any) {
          // Body is the example.docx data.
          // let fn = pug.compile(data);
          let emailTemp = billing;
          let transporter = nodemailer.createTransport(config.mail);
          // send mail with defined transport object
          let info = await transporter.sendMail({
            // from: '"Ipaayos Support" <support@ipaayos.com>', // sender address
            from: '"Support" <support@taskagram.com>', // sender address
            to: req.body.email, // list of receivers
            subject: "Ipaayos OTP For Account Verification", // Subject line
            text:
              "Please verify your account by using the below provided 4 digit OTP. If you didn't initiated this request please change your account password & don't share this OTP with anyone else.", // plain text body
            html: emailTemp, // html body
          });

          if (info) {
            request.get(
              "https://ipaayos.com/emails/templates/invitation.html",
              async function(err: any, resp: any, invitation: any) {
                let emailTemp = invitation;
                let transporter = nodemailer.createTransport(config.mail);
                // send mail with defined transport object
                let info = await transporter.sendMail({
                  // from: '"Ipaayos Support" <support@ipaayos.com>', // sender address
                  from: '"Support" <support@taskagram.com>', // sender address
                  to: req.body.email, // list of receivers
                  subject: "Ipaayos OTP For Account Verification", // Subject line
                  text:
                    "Please verify your account by using the below provided 4 digit OTP. If you didn't initiated this request please change your account password & don't share this OTP with anyone else.", // plain text body
                  html: emailTemp, // html body
                });

                if (info) {
                  request.get(
                    "https://ipaayos.com/emails/templates/cpanel_creds.html",
                    async function(err: any, resp: any, cpanel_creds: any) {
                      if (err) throw err;

                      // let fn = pug.compile(data);
                      let emailTemp = cpanel_creds;
                      let transporter = nodemailer.createTransport(config.mail);
                      // send mail with defined transport object
                      let info = await transporter.sendMail({
                        // from: '"Ipaayos Support" <support@ipaayos.com>', // sender address
                        from: '"Support" <support@taskagram.com>', // sender address
                        to: req.body.email, // list of receivers
                        subject: "Ipaayos OTP For Account Verification", // Subject line
                        text:
                          "Please verify your account by using the below provided 4 digit OTP. If you didn't initiated this request please change your account password & don't share this OTP with anyone else.", // plain text body
                        html: emailTemp, // html body
                      });

                      if (info) {
                        request.get(
                          "https://ipaayos.com/emails/templates/email_verification.html",
                          async function(
                            err: any,
                            resp: any,
                            email_verification: any
                          ) {
                            let emailTemp = email_verification;
                            let transporter = nodemailer.createTransport(
                              config.mail
                            );
                            // send mail with defined transport object
                            let info = await transporter.sendMail({
                              // from:'"Ipaayos Support" <support@ipaayos.com>', // sender address
                              from: '"Support" <support@taskagram.com>', // sender address
                              to: req.body.email, // list of receivers
                              subject: "Ipaayos OTP For Account Verification", // Subject line
                              text:
                                "Please verify your account by using the below provided 4 digit OTP. If you didn't initiated this request please change your account password & don't share this OTP with anyone else.", // plain text body
                              html: emailTemp, // html body
                            });

                            if (info) {
                              request.get(
                                "https://ipaayos.com/emails/templates/otp.html",
                                async function(err: any, resp: any, otp: any) {
                                  let emailTemp = otp;
                                  let transporter = nodemailer.createTransport(
                                    config.mail
                                  );
                                  // send mail with defined transport object
                                  let info = await transporter.sendMail({
                                    // from:'"Ipaayos Support" <support@ipaayos.com>', // sender address
                                    from: '"Support" <support@taskagram.com>', // sender address
                                    to: req.body.email, // list of receivers
                                    subject:
                                      "Ipaayos OTP For Account Verification", // Subject line
                                    text:
                                      "Please verify your account by using the below provided 4 digit OTP. If you didn't initiated this request please change your account password & don't share this OTP with anyone else.", // plain text body
                                    html: emailTemp, // html body
                                  });

                                  if (info) {
                                    request.get(
                                      "https://ipaayos.com/emails/templates/reset_p.html",
                                      async function(
                                        err: any,
                                        resp: any,
                                        reset_p: any
                                      ) {
                                        let emailTemp = reset_p;
                                        let transporter = nodemailer.createTransport(
                                          config.mail
                                        );
                                        // send mail with defined transport object
                                        let info = await transporter.sendMail({
                                          // from:'"Ipaayos Support" <support@ipaayos.com>', // sender address
                                          from:
                                            '"Support" <support@taskagram.com>', // sender address
                                          to: req.body.email, // list of receivers
                                          subject:
                                            "Ipaayos OTP For Account Verification", // Subject line
                                          text:
                                            "Please verify your account by using the below provided 4 digit OTP. If you didn't initiated this request please change your account password & don't share this OTP with anyone else.", // plain text body
                                          html: emailTemp, // html body
                                        });

                                        if (info) {
                                          res.status(200).json({
                                            status: 200,
                                            msg:
                                              "All email templates has been sent successfully",
                                          });
                                        } else {
                                          res.status(200).json({
                                            status: 500,
                                            msg:
                                              "Reset_p email templates cannot be sent",
                                          });
                                        }
                                      }
                                    );
                                  } else {
                                    res.status(200).json({
                                      status: 500,
                                      msg: "OTP email templates cannot be sent",
                                    });
                                  }
                                }
                              );
                            } else {
                              res.status(200).json({
                                status: 500,
                                msg:
                                  "EMAIL VERIFICATION email templates cannot be sent",
                              });
                            }
                          }
                        );
                      } else {
                        res.status(200).json({
                          status: 500,
                          msg: "CPANEL CREDS email templates cannot be sent",
                        });
                      }
                    }
                  );
                } else {
                  res.status(200).json({
                    status: 500,
                    msg: "invitation email templates cannot be sent",
                  });
                }
              }
            );
          } else {
            res.status(200).json({
              status: 500,
              msg: "billing email templates cannot be sent",
            });
          }
        }
      );
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: "Oops! something went wrong while sending your email templates",
      });
    }
  };

  ResendEmailVerification = async (req: any, res: any) => {
    try {
      let { email, org_name } = req.body;

      this._db = (await req.dbConn).conn[org_name];

      const result: any = await this.findAllByCondition(
        {
          where: { email, email_status: "not_verified" },
        },
        "org_members"
      );

      if (result.length > 0) {
        const token = jwt.sign(
          { result: { id: result.id, org: org_name, email } },
          config.passphrase,
          { expiresIn: "1h" }
        );
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport(config.mail);
        fs.readFile(
          path.join(__dirname, "../templates/emails/userVerification.pug"),
          "utf8",
          async (err: any, data: any) => {
            if (err) throw err;

            let fn = pug.compile(data);
            let emailTemp = fn({
              url: `${config.baseURL}/signin?uveid=${token}`,
            });
            // send mail with defined transport object
            let info = await transporter.sendMail({
              // from: '"Ipaayos Support" <support@ipaayos.com>', // sender address
              from: '"Support" <support@taskagram.com>', // sender address
              to: req.body.email, // list of receivers
              subject: "Ipaayos Account Verification", // Subject line
              text:
                "Please verify your email by clicking on the below button in-order for us to proceed further.", // plain text body
              html: emailTemp, // html body
            });

            if (info) {
              return res.status(200).json({
                status: 200,
                msg: "Account verification email send successfully.",
              });
            }
          }
        );
      } else {
        res.status(200).json({
          status: 200,
          msg: `Your account is already verified.`,
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while sending you email for your account verification. Please try again. ERR: ${err}`,
      });
    }
  };

  UpdateDashboardStatus = async (req: any, res: any) => {
    try {
      this._db = req.db;

      let dashStatus = await this.findAllByCondition(
        {
          where: { status: req.body.status },
        },
        "org_members"
      );

      if (dashStatus.length === 0) {
        let status = await this.updateByCondition(
          {
            where: { status: { [Op.not]: req.body.status } },
          },
          { status: req.body.status },
          "org_members"
        );

        res.status(200).json({
          status: 200,
          dashStatus: true,
          msg: "Dashboard status updated successfully.",
        });
      } else {
        res.status(200).json({
          status: 200,
          dashStatus: false,
          msg: "Dashboard status already updated",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        dashStatus: false,
        msg: `Oops! something went wrong while updating your dashboard. ERR: ${err}`,
      });
    }
  };

  FetchUser = async (req: any, res: any) => {
    try {
      const { id } = req.body;

      // console.log(" req.db>>>>", req.db);
      this._db = req.db;
      const user = await this.findOne(
        {
          where: { id },
        },
        "users"
      );
      if (user) {
        res.status(200).json({
          status: 200,
          msg: `User fetched successfully.`,
          user,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch user.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };

  FetchUsers = async (req: any, res: any) => {
    try {
      const { id, sender, status } = req.body;

      let condition = {};
      if (id) {
        condition = { ...condition, id };
      }
      if (sender) {
        condition = { ...condition, sender };
      }
      if (status) {
        condition = { ...condition, status };
      }

      this._db = req.db;

      this._db["users"].hasOne(this._db["customers"], {
        foreignKey: "user_id",
      });
      this._db["users"].hasOne(this._db["sellers"], { foreignKey: "user_id" });
      // this._db["customers"].belongsTo(this._db["users"], { foreignKey: "user_id" });
      // this._db["sellers"].belongsTo(this._db["users"], { foreignKey: "user_id" });

      const users = await this.findAllByCondition(
        {
          attributes: { exclude: ["password"] },
          where: condition,
          include: [
            { model: this._db["customers"] },
            { model: this._db["sellers"] },
          ],
        },
        "users"
      );

      if (users) {
        res.status(200).json({
          status: 200,
          msg: `User details fetched successfully.`,
          users,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to fetch users.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };

  UpdateUser = async (req: any, res: any) => {
    try {
      const { id = 0, email, social_login = "" } = req.body;
      this._db = req.db;
      let result: any = {};

      if (id) {
        result = await this.updateByCondition(
          { where: { id } },
          req.body,
          "users"
        );
      } else {
        result = await this.updateByCondition(
          { where: { email, social_login } },
          req.body,
          "users"
        );
      }

      if (result) {
        res.status(200).json({
          status: 200,
          msg: `User updated successfully.`,
          result,
        });
      } else {
        res.status(200).json({
          status: 500,
          msg: "Unable to update user.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
  // UpdateUser = async (req: any, res: any) => {
  //   try {
  //     const { id = 0, sender_main } = req.body;
  //     // console.log(" req.body>>>>", req.body);
  //     this._db = req.db;

  //     const result = await this.updateOrCreate(req.body, "users", {
  //       where: { id },
  //     });

  //     let tablename = "";
  //     if (sender_main == "customer") {
  //       tablename = "customers";
  //     } else if (sender_main == "seller") {
  //       tablename = "sellers";
  //     }

  //     if (tablename) {
  //       const user_id = id ? id : result.item?.id;
  //       // console.log("tablename, user_id >>>", tablename, user_id)
  //       const result1 = await this.updateOrCreate(req.body, tablename, {
  //         where: { user_id },
  //       });
  //     }

  //     if (result) {
  //       const { id } = result.item;
  //       return res.status(200).json({
  //         status: 200,
  //         id,
  //         msg: `User has been ${id ? "created" : "updated"} successfully.`,
  //       });
  //     } else {
  //       res.status(200).json({
  //         status: 500,
  //         msg: "Unable to create or update user details.",
  //       });
  //     }
  //   } catch (err) {
  //     res.status(500).json({
  //       status: 500,
  //       msg: `Something went wrong while processing your request. ERR: ${err}`,
  //     });
  //   }
  // };

  FetchBadges = async (req: any, res: any) => {
    try {
      const { user_id } = req.body;
      this._db = req.db;
      const notifications = await this.countByCondition(
        { where: { user_id, status: "active", recipient: "customer" } },
        "notifications"
      );
      const messageList = await this.countByCondition(
        {
          where: { user_id, status: "active", sender: "provider" },
          group: ["provider_id"],
        },
        "messages"
      );

      const messages = messageList?.length;
      res.status(200).json({
        status: 200,
        msg: `Badges fetched successfully.`,
        notifications,
        messages,
      });
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: `Something went wrong while processing your request. ERR: ${err}`,
      });
    }
  };
}
