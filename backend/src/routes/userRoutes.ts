import express from "express";

import userController from "../controllers/userController";

const router = express.Router();

router.post("/register", userController.registerUser);

router.post("/request_host", userController.requestHostUser);

router.post("/get_user_list", userController.getUserList);

router.post("/get_list_cars", userController.getAllCarList);

router.post("/get_car_by_id", userController.getCarById);

router.post("/update_profile", userController.updateProfile);//not used

router.post("/redeem-token", userController.redeemToken);//not used
router.post("/exchange-session", userController.exchangeSession);//not used





export default router;