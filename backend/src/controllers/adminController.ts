import { Request, Response } from 'express';
import AdminService from './services/adminService';
import commonHelper from '../helpers/commonHelper';
class AdminController {

  async getListUsers(req: Request, res: Response) {
    try {
      console.log(req.body, "getListUsers body")
      const uuid = req?.user?.sub;

      const { page, limit, search } = req.body;
      await AdminService.getListUsers(
        {
          uuid, page, limit, search
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getOnboardingRequests(req: Request, res: Response) {
    try {
      console.log(req.body, "getOnboardingRequests here")
      const uuid = req?.user?.sub;
      const { page, limit, search } = req.body;
      await AdminService.getOnboardingRequests(
        { uuid, page, limit, search },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }


  async getHostOnboardingDetail(req: Request, res: Response) {
    try {
      console.log(req.body, "getOnboardingRequests here")
      const uuid = req?.user?.sub;
      const { userUuid } = req.body;
      await AdminService.getHostOnboardingDetail(
        { uuid, userUuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getDriverDetail(req: Request, res: Response) {
    try {
      console.log(req.body, "getOnboardingRequests here")
      const uuid = req?.user?.sub;
      const { userUuid } = req.body;
      await AdminService.getDriverDetail(
        { uuid, userUuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getVehicleDetail(req: Request, res: Response) {
    try {
      console.log(req.body, "getOnboardingRequests here")
      const uuid = req?.user?.sub;
      const { userUuid } = req.body;
      await AdminService.getVehicleDetail(
        { uuid, userUuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getAdditionalDetail(req: Request, res: Response) {
    try {
      console.log(req.body, "getOnboardingRequests here")
      const uuid = req?.user?.sub;
      const { userUuid } = req.body;
      await AdminService.getAdditionalDetail(
        { uuid, userUuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getUserDetailById(req: Request, res: Response) {
    try {
      console.log(req.body, "getUserDetailById here")
      const uuid = req?.user?.sub;
      const { id } = req.body;
      await AdminService.getUserDetailById(
        { uuid, id },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async updateDriverDocumentStatus(req: Request, res: Response) {
    try {
      console.log(req.body, "updateDriverDocumentStatus here")
      const uuid = req?.user?.sub;
      const { userUuid, field, status } = req.body;
      await AdminService.updateDriverDocumentStatus(
        { uuid, userUuid, field, status },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async updateVehicleDocumentStatus(req: Request, res: Response) {
    try {
      console.log(req.body, "updateVehicleDocumentStatus here")
      const uuid = req?.user?.sub;
      const { userUuid, field, status } = req.body;
      await AdminService.updateVehicleDocumentStatus(
        { uuid, userUuid, field, status },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async updateAdditionalDetailStatus(req: Request, res: Response) {
    try {
      console.log(req.body, "updateAdditionalDetailStatus here")
      const uuid = req?.user?.sub;
      const { userUuid, field, status } = req.body;
      await AdminService.updateAdditionalDetailStatus(
        { uuid, userUuid, field, status },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async addTax(req: Request, res: Response) {
    try {
      console.log(req.body, "addTax here")
      const uuid = req?.user?.sub;
      const {
        tax_name,
        tax_type,
        city,
        tax_percentage
      } = req.body;
      await AdminService.addTax(
        {
          uuid,
          tax_name,
          tax_type,
          city,
          tax_percentage
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  async editTax(req: Request, res: Response) {
    try {
      console.log(req.body, "editTax here")
      const uuid = req?.user?.sub;
      const { tax_id, tax_name, tax_type, city, tax_percentage } = req.body;
      await AdminService.editTax(
        { uuid, tax_id, tax_name, tax_type, city, tax_percentage },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  async listTax(req: Request, res: Response) {
    try {
      console.log(req.body, "listTax here")
      const uuid = req?.user?.sub;
      await AdminService.listTax(
        { uuid },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  async deleteTax(req: Request, res: Response) {
    try {
      console.log(req.body, "deleteTax here")
      const uuid = req?.user?.sub;
      const { tax_id } = req.body;
      await AdminService.deleteTax(
        { uuid, tax_id },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
  async approvalDriver(req: Request, res: Response) {
    try {
      console.log(req.body, "approvalDriver here")
      const uuid = req?.user?.sub;
      const {
        userUuid
      } = req.body;
      await AdminService.approvalDriver(
        {
          uuid,
          userUuid
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async addOrUpdatePricing(req: Request, res: Response) {
    try {
      console.log(req.body, "addOrUpdatePricing here")
      const uuid = req?.user?.sub;
      const {
        start_price,
        price_per_km,
        initial_wait_time,
        wait_time_cost,
        cancel_fees,
        platform_fee,
        admin_commission,
        sedan_price_per_km,
        suv_price_per_km,
        muv_price_per_km,
        coupe_price_per_km,
        convertible_price_per_km
      } = req.body;
      await AdminService.addOrUpdatePricing(
        {
          uuid,
          start_price,
          price_per_km,
          initial_wait_time,
          wait_time_cost,
          cancel_fees,
          platform_fee,
          admin_commission,
          sedan_price_per_km,
          suv_price_per_km,
          muv_price_per_km,
          coupe_price_per_km,
          convertible_price_per_km
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }


  async fetchPricing(req: Request, res: Response) {
    try {
      console.log(req.body, "fetchPricing here")
      const uuid = req?.user?.sub;

      await AdminService.fetchPricing(
        {
          uuid
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }

  async getDriverslist(req: Request, res: Response) {
    try {
      console.log(req.body, "fetchPricing here")
      const uuid = req?.user?.sub;
      const {
        page, limit, search
      } = req.body;
      await AdminService.getDriverslist(
        {
          uuid, page, limit, search
        },
        res
      );

    } catch (error: any) {
      commonHelper.errorMessage("Error:" + error, res)
    }
  }
}



export default new AdminController();
