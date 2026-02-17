import { Request, Response } from 'express';
import UserService from './services/userService'; // adjust import as needed
 
import commonHelper from '../helpers/commonHelper';
class UserController {

  async registerUser(req: Request, res: Response) {
    try {
      console.log(req.body, "body here")
      const {  uuid, email, emailVerified, phone, type, client, username } = req.body;

      await UserService.registerUser(
        { uuid, email, emailVerified, phone, type, client, username },
        res
      );

    } catch (error: any) {
      console.log(error);
      commonHelper.errorMessage("Error:"+error, res)
    }
  }

  async requestHostUser(req: Request, res: Response) {
    try {
      console.log(req.body, "body here")
      const {  uuid } = req.body;

      await UserService.requestHostUser(
        { uuid },
        res
      );

    } catch (error: any) {
      console.log(error);
      commonHelper.errorMessage("Error:"+error, res)
    }
  }

  async getUserList(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      const {  uuid } = req.body;

      await UserService.getUserList(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:"+error, res)
    }
  }

  
  async getAllCarList(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      // const {   } = req.body;

      await UserService.getAllCarList(
        {  },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:"+error, res)
    }
  }
  
  async getCarById(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      const { id } = req.body;

      await UserService.getCarById(
        { id },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:"+error, res)
    }
  }

   async updateProfile(req: Request, res: Response) {
    try {
      console.log(req.body, "updateProfile body")
      const { uuid, email, phone } = req.body;

      await UserService.updateProfile(
        { uuid, email, phone },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:"+error, res)
    }
  }

  
  async redeemToken(req: Request, res: Response) {
    try {
      console.log(req.body, "redeemToken body")
      const { login_token } = req.body;

      await UserService.redeemToken(
        {login_token },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:"+error, res)
    }
  }

  
  async exchangeSession(req: Request, res: Response) {
    try {
      console.log(req.body, "exchangeSession body")
      const { access_token, refresh_token } = req.body;

      await UserService.exchangeSession(
        {access_token, refresh_token },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:"+error, res)
    }
  }
  
}

export default new UserController();
