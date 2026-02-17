import { Request, Response } from 'express';
import MemberService from './services/memberService'; // adjust import as needed

import commonHelper from '../helpers/commonHelper';
class UserController {

  async requestHostUser(req: Request, res: Response) {
    try {
      console.log(req.body, "body requestHostUser here")
      const uuid = req?.user?.sub;
      // const {  uuid } = req.body;

      await MemberService.requestHostUser(
        { uuid },
        res
      );

    } catch (error: any) {
      console.log(error);
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async addOrUpdateProfile(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      const uuid = req?.user?.sub;
      const { first_name, last_name, address, postal_code, apartment_number, email,
        phone } = req.body;

      await MemberService.addOrUpdateProfile(
        {
          uuid, first_name, last_name, address, postal_code, apartment_number, email,
          phone
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async checkMerchant(req: Request, res: Response) {
    try {
      console.log(req.body, "body checkMerchant here")
      const uuid = req?.user?.sub;
      // const {  uuid } = req.body;

      await MemberService.checkMerchant(
        { uuid },
        res
      );

    } catch (error: any) {
      console.log(error);
      commonHelper.errorMessage("Error:" + error, res)
    }
  }



  async fetchPricing(req: Request, res: Response) {
    try {
      console.log(req.body, "fetchPricing here")
      const uuid = req?.user?.sub;

      await MemberService.fetchPricing(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getNearbyDrivers(req: Request, res: Response) {
    try {
      console.log(req.body, "getNearbyDrivers here")
      const uuid = req?.user?.sub;

      const { lat, lng, ride_distance, timezone } = req.body;
      console.log
      await MemberService.getNearbyDrivers(
        { uuid, lat, lng, ride_distance, timezone },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }


  async bookRide(req: Request, res: Response) {
    try {
      console.log(req.body, "bookRide here")
      const uuid = req?.user?.sub;

      const { pickup, destination, estimatedFare, rideDistance, driverId, paymentMethodId } = req.body;

      await MemberService.bookRide(
        { uuid, pickup, destination, estimatedFare, rideDistance, driverId, paymentMethodId  },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async acceptRide(req: Request, res: Response) {
    try {
      console.log(req.body, "acceptRide here")
      const uuid = req?.user?.sub;

      const { rideId } = req.body;
      console.log
      await MemberService.acceptRide(
        { uuid, rideId },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  async rejectRide(req: Request, res: Response) {
    try {
      console.log(req.body, "rejectRide here")
      const uuid = req?.user?.sub;

      const { rideId } = req.body;
      console.log
      await MemberService.rejectRide(
        { uuid, rideId },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }


  async getRideDetailById(req: Request, res: Response) {
    try {
      console.log(req.body, "getRideDetailById here")
      const uuid = req?.user?.sub;

      const { rideId } = req.body;

      await MemberService.getRideDetailById(
        { uuid, rideId },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async addPushNotification(req: Request, res: Response) {
    try {
      console.log(req.body, "addPushNotification here")
      const uuid = req?.user?.sub;

      const {
        push_token,
        platform,
        browser
      } = req.body;

      await MemberService.addPushNotification(
        {
          uuid,
          push_token,
          platform,
          browser
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async removePushNotification(req: Request, res: Response) {
    try {
      console.log(req.body, "remove_push_notification here")
      const uuid = req?.user?.sub;

      const {
        platform,
        browser
      } = req.body;

      await MemberService.removePushNotification(
        {
          uuid,
          platform,
          browser
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  
  async getActiveRidePassenger(req: Request, res: Response) {
    try {
      console.log(req.body, "getActiveRidePassenger here")
      const uuid = req?.user?.sub;
      await MemberService.getActiveRidePassenger(
        {
          uuid
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  
  async getPassengerFinalFare(req: Request, res: Response) {
    try {
      console.log(req.body, "getPassengerFinalFare here")
      const uuid = req?.user?.sub;
      const {rideId} = req.body;
      await MemberService.getPassengerFinalFare(
        {
          uuid,rideId
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  
  async getRideHistory(req: Request, res: Response) {
    try {
      
      const uuid = req?.user?.sub;
       const { page, limit} = req.body;
      await MemberService.getRideHistory(
        {
          uuid, page, limit
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  
  
   async capturePayment(req: Request, res: Response) {
    try {
      const uuid = req?.user?.sub;
      const { rideId, finalAmount} = req.body;
      await MemberService.capturePayment(
        {
           uuid , rideId, finalAmount
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

}

export default new UserController();
