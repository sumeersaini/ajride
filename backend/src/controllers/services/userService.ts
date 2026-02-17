import db from "../../models";
const { QueryTypes } = require("sequelize");
// const MyQuery = db.sequelize;
import { Request, Response } from 'express';

import commonHelper from "../../helpers/commonHelper";
import { where } from "sequelize";
 
 
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_KEY;

// Create a Supabase client for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

class UserService {
  /**
   * Registers a new user
   */
  async registerUser(payload: any, res: Response) {
    try {
      const { uuid, email, emailVerified, phone, type, client, username } = payload;

      console.log("inside userservice py", payload)
      // console.log("payload add newuser", payload)
      let merchant = 0;
      if (client == "host"){
        merchant = 1;
      } 

      if (uuid.length > 0) {
        if (type == "email") {
          var checkEmail = await db.User.findOne({
            where: {
              email,
            },
          })

          if (checkEmail) {
            return res.status(409).send({
              message: 'User already exists',
              data: checkPhone,
            });
          } else {
            var result = await db.User.create({
              uuid, email, email_verified: emailVerified, active: true, username, client, phone, type, merchant
            });
          }

        } else {
          var checkPhone = await db.User.findOne({
            where: {
              phone
            },
          })

          if (checkPhone) {
            return res.status(409).send({
              message: 'User already exists',
              data: checkPhone,
            });
          } else {
            var result = await db.User.create({
              uuid, email, email_verified: emailVerified, active: true, username: username, type, client, phone, merchant
            });
          }
        }

        return res.status(200).send({
          message: "User Register Successfully",
          data: result,
        });

      }

    } catch (error: any) {
      console.log(error, "error")
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async requestHostUser(payload: any, res: Response) {
    try {
      const { uuid } = payload;

      console.log("inside host request", payload)
       var checkUser = await db.User.findOne({
            where: {
              uuid,
            },
          })

        if (checkUser) {
          await checkUser.update({
            client: "host",
            merchant: 1
          });

          return res.status(200).send({
              message: "Host request sent Successfully",
            });
        } else {
          return res.status(200).send({
            message: "User not found",
          });
        }

    } catch (error: any) {
      console.log(error, "error")
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getUserList(payload: any, res: Response) {
    try {
      const { uuid } = payload;

      console.log("inside get userlist py", payload)
      // console.log("payload add newuser", payload)

      var allUsers = await db.User.findAll();

      commonHelper.successMessage(allUsers, "User list get successfully", res);
    } catch (error: any) {
      console.log(error, "error")
      commonHelper.errorMessage("Error:" + error, res);
    }
  }


  async getAllCarList(payload: any, res: Response) {
    try {
      const allCars = await db.Car.findAll();
      commonHelper.successMessage(allCars, "Car list fetched successfully", res);
    } catch (error: any) {
      console.error("Get Car List Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }
  async getCarById(payload: any, res: Response) {
    try {
      const { id } = payload;

      const car = await db.Car.findOne({
        where: {
          id
        },
      })

      if (!car) {
        return commonHelper.errorMessage("Car not found", res);
      }

      commonHelper.successMessage(car, "Car fetched successfully", res);
    } catch (error: any) {
      console.error("Get Car By ID Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }


  async updateProfile(payload: any, res: Response) {
    try {
      const { uuid, email, phone } = payload;

      const userData = await db.User.findOne({
        where: { uuid },
      });

      if (!userData) {
        return commonHelper.errorMessage("User not found", res);
      }

      // Update fields
      userData.email = email;
      userData.phoneNumber = phone;

      await userData.save();

      return commonHelper.successMessage(userData, "Update Profile successfully!", res);
    } catch (error: any) {
      console.error("Update Profile Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async redeemToken(payload: any, res: Response) {
    try {
      const { login_token } = payload;

      if (!login_token) {
        return commonHelper.errorMessage("Login token is required", res);
      }

      // Look up the token in your temporary storage
      const tempTokenRecord = await db.TempLoginTokens.findOne({
        where: { token: login_token },
      });

      if (!tempTokenRecord) {
        return commonHelper.errorMessage("Invalid or expired login token", res);
      }

      // Immediately delete the token to ensure it is single-use
      await db.TempLoginTokens.destroy({
        where: { token: login_token },
      });

      // Check if the token has expired
      const now = new Date();
      const tokenExpiration = new Date(tempTokenRecord.createdAt.getTime() + 60 * 1000); // 60 seconds
      if (now > tokenExpiration) {
        return commonHelper.errorMessage("Login token has expired", res);
      }

      // Parse the stored session data
      const sessionData = JSON.parse(tempTokenRecord.sessionData);

      return commonHelper.successMessage(sessionData, "Session fetched successfully", res);
    } catch (error:any) {
      console.error("Redeem Token Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }


  async exchangeSession(payload: any, res: Response) {
    try {
      const crypto = require('crypto');
      const { access_token, refresh_token } = payload;

      if (!access_token || !refresh_token) {
        return commonHelper.errorMessage("Access and refresh tokens are required", res);
      }

      // Verify the tokens with Supabase on the server
      const { data: { user }, error: authError } = await supabase.auth.getUser(access_token);

      if (authError || !user) {
        return commonHelper.errorMessage("Invalid Supabase tokens", res);
      }

      // Generate a new, random, single-use token
      const loginToken = crypto.randomBytes(32).toString('hex');

      // Store the Supabase session data in your temporary cache
      // The created_at field will be used to check for expiration
      await db.TempLoginTokens.create({
        token: loginToken,
        sessionData: JSON.stringify({ access_token, refresh_token }),
        userId: user.id, // Optional: useful for debugging
      });

      return commonHelper.successMessage({ login_token: loginToken }, "Login token generated", res);
    } catch (error:any) {
      console.error("Exchange Session Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }


}


export default new UserService();