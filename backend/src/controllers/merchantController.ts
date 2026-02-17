import { Request, Response } from 'express';
import MerchantService from './services/merchantService'; // adjust import as needed

import commonHelper from '../helpers/commonHelper';
class MerchantController {

  async addHostDetails(req: Request, res: Response) {
    try {
      console.log(req.body, "addHostDetails body")
      const uuid = req?.user?.sub;
      const {
        contact_email,
        contact_phone,
        birthdate,
        city,
      } = req.body;

      await MerchantService.addHostDetails(
        {
          uuid,
          contact_email,
          contact_phone,
          birthdate,
          city,
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async editHostDetails(req: Request, res: Response) {
    try {
      console.log(req.body, "editHostDetails body")
      const uuid = req?.user?.sub;

      const {
        id,
        contact_email,
        contact_phone,
        birthdate,
        city,
      } = req.body;

      await MerchantService.editHostDetails(
        {
          uuid,
          id,
          contact_email,
          contact_phone,
          birthdate,
          city,
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }


  async getHostDetail(req: Request, res: Response) {
    try {
      console.log(req.body, "getHostDetail here")
      const uuid = req?.user?.sub;

      await MerchantService.getHostDetail(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async addDriverDetails(req: Request, res: Response) {
    try {
      console.log(req.body, "addDriverDetails body")
      const uuid = req?.user?.sub;

      const {
        license_class,
        license_number,
        proof_of_work_eligibility,
        driver_history,
        background_check,
        city_licensing,
        driver_licence,
      } = req.body;

      await MerchantService.addDriverDetails(
        {
          uuid,
          license_class,
          license_number,
          proof_of_work_eligibility,
          driver_history,
          background_check,
          city_licensing,
          driver_licence,
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  async editDriverDetails(req: Request, res: Response) {
    try {
      console.log(req.body, "editDriverDetails body")
      const uuid = req?.user?.sub;

      const {
        id,
        license_class,
        license_number,
        proof_of_work_eligibility,
        driver_history,
        background_check,
        city_licensing,
        driver_licence,
      } = req.body;

      await MerchantService.editDriverDetails(
        {
          uuid,
          id,
          license_class,
          license_number,
          proof_of_work_eligibility,
          driver_history,
          background_check,
          city_licensing,
          driver_licence,
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getDriverDetail(req: Request, res: Response) {
    try {
      console.log(req.body, "getHostDetail here")
      const uuid = req?.user?.sub;

      await MerchantService.getDriverDetail(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async addVehicleDetails(req: Request, res: Response) {
    try {
      console.log(req.body, "addVehicleDetails body")
      const uuid = req?.user?.sub;

      const {
        vehicle_number,
        vehicle_type,
        vehicle_registration,
        insurance_information,
        safety_inspection,
      } = req.body;

      await MerchantService.addVehicleDetails(
        {
          uuid,
          vehicle_number,
          vehicle_type,
          vehicle_registration,
          insurance_information,
          safety_inspection,
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async editVehicleDetails(req: Request, res: Response) {
    try {
      console.log(req.body, "editVehicleDetails body")
      const uuid = req?.user?.sub;

      const {
        id,
        vehicle_number,
        vehicle_type,
        vehicle_registration,
        insurance_information,
        safety_inspection,
      } = req.body;

      await MerchantService.editVehicleDetails(
        {
          uuid,
          id,
          vehicle_number,
          vehicle_type,
          vehicle_registration,
          insurance_information,
          safety_inspection,
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getVehicleDetail(req: Request, res: Response) {
    try {
      console.log(req.body, "getVehicleDetail here")
      const uuid = req?.user?.sub;

      await MerchantService.getVehicleDetail(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async addAdditionalDetails(req: Request, res: Response) {
    try {
      console.log(req.body, "addAdditionalDetails body")
      const uuid = req?.user?.sub;

      const {
        hst_number,
        direct_deposit,
      } = req.body;

      await MerchantService.addAdditionalDetails(
        {
          uuid,
          hst_number,
          direct_deposit,
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async editAdditionalDetails(req: Request, res: Response) {
    try {
      console.log(req.body, "editAdditionalDetails body")
      const uuid = req?.user?.sub;

      const {
        id,
        hst_number,
        direct_deposit,
      } = req.body;

      await MerchantService.editAdditionalDetails(
        {
          uuid,
          id,
          hst_number,
          direct_deposit,
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getAdditionalDetail(req: Request, res: Response) {
    try {
      console.log(req.body, "getAdditionalDetail here")
      const uuid = req?.user?.sub;

      await MerchantService.getAdditionalDetail(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async addCar(req: Request, res: Response) {
    try {
      console.log(req.body, "addCar body")
      const {
        uuid,
        car_type,
        car_engine,
        car_name,
        images,
        descriptions,
        price_per_mile,
        owner_name,
        location
      } = req.body;

      await MerchantService.addCar(
        {
          uuid,
          car_type,
          car_engine,
          car_name,
          images,
          descriptions,
          price_per_mile,
          owner_name,
          location
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getCarList(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      const { uuid, page, search } = req.body;

      await MerchantService.getCarList(
        { uuid, page, search },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getAllCarList(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      const { uuid } = req.body;

      await MerchantService.getAllCarList(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }


  async getCarById(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      const { uuid, id } = req.body;

      await MerchantService.getCarById(
        { uuid, id },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async editCarById(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      const {
        uuid,
        id,
        car_type,
        car_engine,
        car_name,
        images,
        descriptions,
        price_per_mile,
        owner_name,
        location
      } = req.body;

      await MerchantService.editCarById(
        {
          uuid,
          id,
          car_type,
          car_engine,
          car_name,
          images,
          descriptions,
          price_per_mile,
          owner_name,
          location
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async deleteCarById(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      const { uuid, id } = req.body;

      await MerchantService.deleteCarById(
        { uuid, id },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async addOrUpdateProfile(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      const uuid = req?.user?.sub;
      const { first_name, last_name, address, postal_code, apartment_number, email,
        phone } = req.body;

      await MerchantService.addOrUpdateProfile(
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

  async getProfile(req: Request, res: Response) {
    try {
      console.log(req.body, "getlist here")
      const uuid = req?.user?.sub;
      // const {  uuid } = req.body;

      await MerchantService.getProfile(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }


  async addOrUpdateDriverStatus(req: Request, res: Response) {
    try {
      console.log(req.body, "addOrUpdateDriverStatus here")
      const uuid = req?.user?.sub;
      const {
        status,
        lat,
        lng,
        current_place,
       
      } = req.body;

      await MerchantService.addOrUpdateDriverStatus(
        {
          uuid,
          status,
          lat,
          lng,
          current_place,
         
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

   async getDriverStatus(req: Request, res: Response) {
    try {
      console.log(req.body, "getDriverStatus here")
      const uuid = req?.user?.sub;
 
      await MerchantService.getDriverStatus(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  
  
  async getRideDetailByIdMerchant(req: Request, res: Response) {
    try {
      console.log(req.body, "getRideDetailByIdMerchant here")
      const uuid = req?.user?.sub;
      const {rideId} = req.body;
      await MerchantService.getRideDetailByIdMerchant(
        {  uuid, rideId },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  
  async cancelRide(req: Request, res: Response) {
    try {
      console.log(req.body, "cancelRide here")
      const uuid = req?.user?.sub;
      const { rideId, cancelledVia, cancelReason } = req.body;
      await MerchantService.cancelRide(
        {  uuid, rideId, cancelledVia, cancelReason },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  
  async reachDriver(req: Request, res: Response) {
    try {
      console.log(req.body, "reachDriver here")
      const uuid = req?.user?.sub;
      const { rideId, reachedLocation, reachedTiming  } = req.body;
      await MerchantService.reachDriver(
        { uuid, rideId, reachedLocation, reachedTiming  },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

   async startRide(req: Request, res: Response) {
    try {
      console.log(req.body, "startRide here")
      const uuid = req?.user?.sub;
      const { rideId, startLocation, deviceStartTime, otp  } = req.body;
      await MerchantService.startRide(
        { uuid, rideId, startLocation, deviceStartTime, otp },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  
  async getActiveRide(req: Request, res: Response) {
    try {
      console.log(req.body, "getActiveRide here")
      const uuid = req?.user?.sub;
     
      await MerchantService.getActiveRide(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async endRide(req: Request, res: Response) {
    try {
      console.log(req.body, "endRide here")
      const uuid = req?.user?.sub;
     
      const {rideId, reachedLocation, reachedTiming} = req.body;
      await MerchantService.endRide(
        {uuid,rideId, reachedLocation, reachedTiming },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  
  async getDriverFinalFare(req: Request, res: Response) {
    try {
      console.log(req.body, "getDriverFinalFare here")
      const uuid = req?.user?.sub;
     
      const {rideId, reachedLocation, reachedTiming} = req.body;
      await MerchantService.getDriverFinalFare(
        {uuid,rideId, reachedLocation, reachedTiming },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  
  async getRideHistoryDriver(req: Request, res: Response) {
    try {
      console.log(req.body, "getRideHistoryDriver here")
      const uuid = req?.user?.sub;
     
      const {page, limit} = req.body;
      await MerchantService.getRideHistoryDriver(
        {uuid, page, limit },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
}



export default new MerchantController();
