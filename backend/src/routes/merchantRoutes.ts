import express from "express";

import merchantController from "../controllers/merchantController";

const router = express.Router();

router.post("/add_car", merchantController.addCar);
router.post("/get_car_list", merchantController.getCarList);
router.post("/get_all_car_list", merchantController.getAllCarList);
router.post("/get_car_by_id", merchantController.getCarById);
router.post("/edit_car_by_id", merchantController.editCarById);
router.post("/delete_car_by_id", merchantController.deleteCarById);
router.post("/update_profile", merchantController.addOrUpdateProfile);
router.post("/get_profile", merchantController.getProfile);

//onboarding apis
router.post("/add_host_details", merchantController.addHostDetails);
router.post("/update_host_details", merchantController.editHostDetails);
router.post("/add_driver_details", merchantController.addDriverDetails);
router.post("/update_driver_details", merchantController.editDriverDetails);
router.post("/add_vehicle_details", merchantController.addVehicleDetails);
router.post("/update_vehicle_details", merchantController.editVehicleDetails);
router.post("/add_additional_details", merchantController.addAdditionalDetails);
router.post("/update_additional_details", merchantController.editAdditionalDetails);

router.post("/get_additional_detail", merchantController.getAdditionalDetail);
router.post("/get_vehicle_detail", merchantController.getVehicleDetail);
router.post("/get_driver_detail", merchantController.getDriverDetail);
router.post("/get_host_detail", merchantController.getHostDetail);
router.post("/add_update_driver_status", merchantController.addOrUpdateDriverStatus);
router.post("/get_driver_status", merchantController.getDriverStatus);
router.post("/get_ride_detail_by_merchant", merchantController.getRideDetailByIdMerchant);
router.post("/cancel_ride", merchantController.cancelRide);
router.post("/reach_driver", merchantController.reachDriver);
router.post("/start_ride", merchantController.startRide);
router.post("/get_active_ride", merchantController.getActiveRide);
router.post("/end_ride", merchantController.endRide);
router.post("/get_driver_final_fare", merchantController.getDriverFinalFare);
router.post("/get_ride_history_driver", merchantController.getRideHistoryDriver);










export default router;