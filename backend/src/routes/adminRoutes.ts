import express from "express";
import adminController from "../controllers/adminController";

const router = express.Router();


console.log("admin route")
router.post("/get_list_users", adminController.getListUsers);
router.post("/get_onboarding_request", adminController.getOnboardingRequests);
router.post("/get_hostonboarding_detail", adminController.getHostOnboardingDetail);
router.post("/get_driver_detail", adminController.getDriverDetail);
router.post("/get_vehicle_detail", adminController.getVehicleDetail);
router.post("/get_additional_detail", adminController.getAdditionalDetail);
router.post("/get_user_detail_by_id", adminController.getUserDetailById);
router.post("/update_driver_document_status", adminController.updateDriverDocumentStatus);
router.post("/update_vehicle_document_status", adminController.updateVehicleDocumentStatus);
router.post("/update_additional_document_status", adminController.updateAdditionalDetailStatus);
router.post("/add_tax", adminController.addTax);
router.post("/edit_tax", adminController.editTax);
router.post("/list_tax", adminController.listTax);
router.post("/delete_tax", adminController.deleteTax);
router.post("/approval_driver", adminController.approvalDriver);
router.post("/add_Update_pricing", adminController.addOrUpdatePricing);
router.post("/fetch_pricing", adminController.fetchPricing);

router.post("/get_driver_list", adminController.getDriverslist);













export default router;