import express from "express";

import memberController from "../controllers/memberController";

const router = express.Router();

router.post("/request_host", memberController.requestHostUser);
router.post("/check_merchant", memberController.checkMerchant);


router.post("/update_profile", memberController.addOrUpdateProfile);
router.post("/fetch_pricing", memberController.fetchPricing);
router.post("/get_near_by_drivers", memberController.getNearbyDrivers);
router.post("/book_ride", memberController.bookRide);
router.post("/accept_ride", memberController.acceptRide);
router.post("/reject_ride", memberController.rejectRide);
router.post("/get_ride_details_by_id", memberController.getRideDetailById);
router.post("/save_push_notification", memberController.addPushNotification);
router.post("/remove_push_notification", memberController.removePushNotification);
router.post("/get_active_ride_passenger", memberController.getActiveRidePassenger);
router.post("/get_passenger_final_fare", memberController.getPassengerFinalFare);
router.post("/get_ride_history", memberController.getRideHistory);
//stripe apis
 router.post("/capture_payment", memberController.capturePayment);






export default router;