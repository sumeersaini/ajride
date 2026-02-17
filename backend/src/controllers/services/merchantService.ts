import db from "../../models";
const { QueryTypes } = require("sequelize");
// const MyQuery = db.sequelize;
import { Request, Response } from 'express';

import commonHelper from "../../helpers/commonHelper";
import { where } from "sequelize";
import axios from "axios";

const MAP_API_KEY = process.env.MAP_API_KEY;

class MerchantService {

  async addHostDetails(payload: any, res: Response) {
    try {
      const {
        uuid,
        contact_email,
        contact_phone,
        birthdate,
        city,
      } = payload;

      // Check if user exists (optional — adjust based on your setup)
      const getUser = await db.User.findOne({ where: { uuid } });
      if (!getUser) {
        return commonHelper.errorMessage("User not found", res);
      }

      // Create host details entry
      const newHost = await db.HostDetails.create({
        uuid,
        contact_email,
        contact_phone,
        birthdate,
        city,
      });

      commonHelper.successMessage(newHost, "Personal details added successfully", res);
    } catch (error: any) {
      console.error("Add HostDetails Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async editHostDetails(payload: any, res: Response) {
    try {
      const {
        uuid,
        id,
        contact_email,
        contact_phone,
        birthdate,
        city,
      } = payload;

      // Check if record exists
      const host = await db.HostDetails.findOne({ where: { uuid, id } });
      if (!host) {
        commonHelper.errorMessage("Host details not found", res);
      }

      // Update fields
      await host.update({
        contact_email,
        contact_phone,
        birthdate,
        city,
      });

      commonHelper.successMessage(host, "Host details updated successfully", res);
    } catch (error: any) {
      console.error("Edit HostDetails Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async getHostDetail(payload: any, res: Response) {
    try {
      const { uuid } = payload;

      if (!uuid) {
        commonHelper.errorMessage("User not found", res);
      }

      const user = await db.User.findOne({
        where: { uuid },
      });

      if (!user) {
        commonHelper.errorMessage("User not found", res);
      }

      const getDetails = await db.HostDetails.findOne({
        where: { uuid },
      });

      commonHelper.successMessage(getDetails, "Personal Details fetched successfully", res);
    } catch (error: any) {
      console.error("Get Personal details Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async addDriverDetails(payload: any, res: Response) {
    try {
      const {
        uuid,
        license_class,
        license_number,
        proof_of_work_eligibility,
        driver_history,
        background_check,
        city_licensing,
        driver_licence,
      } = payload;

      // Optional: Check if user exists
      const user = await db.User.findOne({ where: { uuid } });
      if (!user) {
        commonHelper.errorMessage("User not found", res);
      }

      const newDriverDetails = await db.DriverDetails.create({
        uuid,
        license_class,
        license_number,
        proof_of_work_eligibility,
        driver_history,
        background_check,
        city_licensing,
        driver_licence,
      });

      commonHelper.successMessage(newDriverDetails, "Driver details added successfully", res);
    } catch (error: any) {
      console.error("Add DriverDetails Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async editDriverDetails(payload: any, res: Response) {
    try {
      const {
        uuid,
        id,
        license_class,
        license_number,
        proof_of_work_eligibility,
        driver_history,
        background_check,
        city_licensing,
        driver_licence,
      } = payload;

      const driverDetails = await db.DriverDetails.findOne({ where: { uuid, id } });
      if (!driverDetails) {
        return commonHelper.errorMessage("Driver details not found", res);
      }

      const updates: any = {
        license_class,
        license_number,
      };

      // Helper to compare and reset status
      const checkAndUpdateDocument = (
        field: string,
        newValue: string | null | undefined
      ) => {
        const oldValue = driverDetails[field];
        if (newValue && newValue !== oldValue) {
          updates[field] = newValue;
          updates[`${field}_status`] = 0; // Reset status to Pending
        }
      };

      checkAndUpdateDocument("proof_of_work_eligibility", proof_of_work_eligibility);
      checkAndUpdateDocument("driver_history", driver_history);
      checkAndUpdateDocument("background_check", background_check);
      checkAndUpdateDocument("city_licensing", city_licensing);
      checkAndUpdateDocument("driver_licence", driver_licence);

      await driverDetails.update(updates);

      return commonHelper.successMessage(driverDetails, "Driver details updated successfully", res);
    } catch (error: any) {
      console.error("Edit DriverDetails Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async getDriverDetail(payload: any, res: Response) {
    try {
      const { uuid } = payload;

      if (!uuid) {
        commonHelper.errorMessage("User not found", res);
      }

      const user = await db.User.findOne({
        where: { uuid },
      });

      if (!user) {
        commonHelper.errorMessage("User not found", res);
      }

      const getDetails = await db.DriverDetails.findOne({
        where: { uuid },
      });

      commonHelper.successMessage(getDetails, "Driver Details fetched successfully", res);
    } catch (error: any) {
      console.error("Get Driver details Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async addVehicleDetails(payload: any, res: Response) {
    try {
      const {
        uuid,
        vehicle_number,
        vehicle_type,
        vehicle_registration,
        insurance_information,
        safety_inspection,
      } = payload;

      // Optional: Check if user exists using uuid
      const user = await db.User.findOne({ where: { uuid } });
      if (!user) {
        commonHelper.errorMessage("User not found", res);
      }

      const newVehicle = await db.VehicleDetails.create({
        uuid,
        vehicle_number,
        vehicle_type,
        vehicle_registration,
        insurance_information,
        safety_inspection,
      });

      commonHelper.successMessage(newVehicle, "Vehicle details added successfully", res);
    } catch (error: any) {
      console.error("Add VehicleDetails Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async editVehicleDetails(payload: any, res: Response) {
    try {
      const {
        uuid,
        id,
        vehicle_number,
        vehicle_type,
        vehicle_registration,
        insurance_information,
        safety_inspection,
      } = payload;

      const vehicle = await db.VehicleDetails.findOne({ where: { uuid, id } });
      if (!vehicle) {
        return commonHelper.errorMessage("Vehicle details not found", res);
      }

      const updates: any = {
        vehicle_number,
        vehicle_type
      };

      // Helper to compare and reset status if document changed
      const checkAndUpdateDocument = (
        field: string,
        newValue: string | null | undefined
      ) => {
        const oldValue = vehicle[field];
        if (newValue && newValue !== oldValue) {
          updates[field] = newValue;
          updates[`${field}_status`] = 0; // Reset status to Pending
        }
      };

      checkAndUpdateDocument("vehicle_registration", vehicle_registration);
      checkAndUpdateDocument("insurance_information", insurance_information);
      checkAndUpdateDocument("safety_inspection", safety_inspection);

      await vehicle.update(updates);

      return commonHelper.successMessage(vehicle, "Vehicle details updated successfully", res);
    } catch (error: any) {
      console.error("Edit VehicleDetails Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async getVehicleDetail(payload: any, res: Response) {
    try {
      const { uuid } = payload;

      if (!uuid) {
        commonHelper.errorMessage("User not found", res);
      }

      const user = await db.User.findOne({
        where: { uuid },
      });

      if (!user) {
        commonHelper.errorMessage("User not found", res);
      }

      const getDetails = await db.VehicleDetails.findOne({
        where: { uuid },
      });

      commonHelper.successMessage(getDetails, "Vehicle Details fetched successfully", res);
    } catch (error: any) {
      console.error("Get Vehicle details Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async addAdditionalDetails(payload: any, res: Response) {
    try {
      const {
        uuid,
        hst_number,
        direct_deposit,
      } = payload;

      // Optional: Check if user exists using uuid
      const user = await db.User.findOne({ where: { uuid } });
      if (!user) {
        commonHelper.errorMessage("User not found", res);
      }

      const newDetails = await db.AdditionalDetails.create({
        uuid,
        hst_number,
        direct_deposit,
      });

      commonHelper.successMessage(newDetails, "Additional details added successfully", res);
    } catch (error: any) {
      console.error("Add AdditionalDetails Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async editAdditionalDetails(payload: any, res: Response) {
    try {
      const {
        uuid,
        id,
        hst_number,
        direct_deposit,
      } = payload;

      const record = await db.AdditionalDetails.findOne({ where: { uuid, id } });
      if (!record) {
        return commonHelper.errorMessage("Additional details not found", res);
      }

      const updates: any = {};

      const checkAndUpdateDocument = (
        field: string,
        newValue: string | null | undefined
      ) => {
        const oldValue = record[field];
        if (newValue && newValue !== oldValue) {
          updates[field] = newValue;
          updates[`${field}_status`] = 0; // Reset status to Pending
        }
      };

      checkAndUpdateDocument("hst_number", hst_number);
      checkAndUpdateDocument("direct_deposit", direct_deposit);

      await record.update(updates);

      return commonHelper.successMessage(record, "Additional details updated successfully", res);
    } catch (error: any) {
      console.error("Edit AdditionalDetails Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async getAdditionalDetail(payload: any, res: Response) {
    try {
      const { uuid } = payload;

      if (!uuid) {
        commonHelper.errorMessage("User not found", res);
      }

      const user = await db.User.findOne({
        where: { uuid },
      });

      if (!user) {
        commonHelper.errorMessage("User not found", res);
      }

      const getDetails = await db.AdditionalDetails.findOne({
        where: { uuid },
      });

      commonHelper.successMessage(getDetails, "Additional Details fetched successfully", res);
    } catch (error: any) {
      console.error("Get Additional details Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  // Add New Car
  async addCar(payload: any, res: Response) {
    try {
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
      } = payload;

      let getUserId = await db.User.findOne({
        where: {
          uuid
        },
      })

      console.log(getUserId, "getUserId")
      let user_id = getUserId.id;

      const newCar = await db.Car.create({
        user_id,
        car_type,
        car_engine,
        car_name,
        images,
        descriptions,
        price_per_mile,
        owner_name,
        location
      });

      commonHelper.successMessage(newCar, "Car added successfully", res);
    } catch (error: any) {
      console.error("Add Car Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  // Get All Cars
  async getCarList(payload: any, res: Response) {
    try {
      const { uuid, page = 1, search = "" } = payload; // page param, default to 1
      const limit = 10; // 10 records per page
      const offset = (page - 1) * limit;

      // Find user by uuid
      const getUserId = await db.User.findOne({
        where: { uuid },
      });

      if (!getUserId) {
        return commonHelper.errorMessage("User not found", res);
      }

      const user_id = getUserId.id;

      const whereCondition: any = { user_id };

      if (search.trim() !== "") {
        const { Op, fn, col, where } = require("sequelize");
        const searchTerm = search.toLowerCase();

        whereCondition[Op.or] = [
          where(fn("LOWER", col("car_name")), { [Op.like]: `%${searchTerm}%` }),
          where(fn("LOWER", col("car_type")), { [Op.like]: `%${searchTerm}%` }),
          where(fn("LOWER", col("car_engine")), { [Op.like]: `%${searchTerm}%` }),
        ];
      }

      // Fetch total count with condition
      const totalRecords = await db.Car.count({
        where: whereCondition,
      });

      // Fetch paginated data with condition
      const cars = await db.Car.findAll({
        where: whereCondition,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalRecords / limit);

      commonHelper.successMessage(
        {
          cars,
          pagination: {
            totalRecords,
            totalPages,
            currentPage: page,
            recordsPerPage: limit,
          },
        },
        "Car list fetched successfully",
        res
      );
    } catch (error: any) {
      console.error("Get Car List Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
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

  // Get Car by ID
  async getCarById(payload: any, res: Response) {
    try {
      const { uuid, id } = payload;
      let getUserId = await db.User.findOne({
        where: {
          uuid,
        },
      })

      let user_id = getUserId.id;

      const car = await db.Car.findOne({
        where: {
          user_id, id
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

  // Edit Car by ID
  async editCarById(payload: any, res: Response) {
    try {
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
      } = payload;

      const getUser = await db.User.findOne({
        where: { uuid },
      });

      if (!getUser) {
        return commonHelper.errorMessage("User not found", res);
      }

      const user_id = getUser.id;

      const [updatedCount] = await db.Car.update(
        {
          car_type,
          car_engine,
          car_name,
          images,
          descriptions,
          price_per_mile,
          owner_name,
          location
        },
        {
          where: { id, user_id },
        }
      );

      if (updatedCount === 0) {
        return commonHelper.errorMessage("Car not found or no changes made", res);
      }

      // Fetch updated car data
      const updatedCar = await db.Car.findByPk(id);
      return commonHelper.successMessage(updatedCar, "Car updated successfully", res);

    } catch (error: any) {
      console.error("Edit Car Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  // Delete Car by ID
  async deleteCarById(payload: any, res: Response) {
    try {
      const { id, uuid } = payload;
      let getUserId = await db.User.findOne({
        where: {
          uuid,
        },
      })

      let user_id = getUserId.id;
      const deleted = await db.Car.destroy({ where: { id, user_id } });

      if (deleted === 0) {
        return commonHelper.errorMessage("Car not found", res);
      }

      commonHelper.successMessage(null, "Car deleted successfully", res);
    } catch (error: any) {
      console.error("Delete Car Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async addOrUpdateProfile(payload: any, res: Response) {
    try {
      const {
        uuid,
        first_name,
        last_name,
        address,
        postal_code,
        apartment_number,
        email,
        phone
      } = payload;

      // Find user by UUID
      const getUser = await db.User.findOne({
        where: { uuid },
      });

      if (!getUser) {
        return commonHelper.errorMessage("User not found", res);
      }


      // Update fields
      let updateUser = false;
      if (getUser.email != email) {
        getUser.email = email;
        updateUser = true;
      }

      if (getUser.phoneNumber != phone) {
        getUser.phoneNumber = phone;
        updateUser = true;
      }
      //update to db
      if (updateUser) {
        await getUser.save();
      }

      const user_id = getUser.id;

      // Check if profile already exists
      const existingProfile = await db.Profile.findOne({
        where: { user_id },
      });

      let profile;

      if (existingProfile) {
        // Update profile
        await existingProfile.update({
          first_name,
          last_name,
          address,
          postal_code,
          apartment_number
        });
        profile = existingProfile;
      } else {
        // Create new profile
        profile = await db.Profile.create({
          user_id,
          first_name,
          last_name,
          address,
          postal_code,
          apartment_number
        });
      }

      commonHelper.successMessage(profile, "Profile saved successfully", res);
    } catch (error: any) {
      console.error("Add/Update Profile Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async getProfile(payload: any, res: Response) {
    try {
      const { uuid } = payload;

      if (!uuid) {
        return commonHelper.errorMessage("UUID is required", res);
      }

      const user = await db.User.findOne({
        where: { uuid },
      });

      if (!user) {
        return commonHelper.errorMessage("User not found", res);
      }

      const profile = await db.Profile.findOne({
        where: { user_id: user.id },
        attributes: ["user_id", "first_name", "last_name", "address", "zip_code"],
      });

      if (!profile) {
        return commonHelper.errorMessage("Profile not found", res);
      }

      return commonHelper.successMessage(profile, "Profile fetched successfully", res);
    } catch (error: any) {
      console.error("Get Profile Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async addOrUpdateDriverStatus(payload: any, res: Response) {
    try {
      const {
        uuid,
        status,
        lat,
        lng,
        current_place,

      } = payload;

      console.log("payload update push token and status", payload);

      // ✅ Validate UUID existence in Driver table
      const driver = await db.User.findOne({ where: { uuid } });
      if (!driver) {
        return commonHelper.errorMessage("Driver not found", res);
      }

      let tokenRecord = await db.Notification.findOne({
        where: { uuid },
      });

      // ✅ Require push token when going online
      if (status === 'online' && !tokenRecord) {
        return commonHelper.errorMessage("Push Notification is required when going online", res);
      }

      // ✅ Check if driver status already exists
      let driverStatus = await db.DriverStatus.findOne({ where: { uuid } });

      if (driverStatus) {
        await driverStatus.update({
          status,
          lat,
          lng,
          current_place,

        });
      } else {
        driverStatus = await db.DriverStatus.create({
          uuid,
          status,
          lat,
          lng,
          current_place,

        });
      }

      return commonHelper.successMessage(
        driverStatus,
        "Driver status saved successfully",
        res
      );

    } catch (error: any) {
      console.error("Add/Update Driver Status Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async getDriverStatus(payload: any, res: Response) {
    try {
      const {
        uuid,
      } = payload;

      // Validate UUID existence in DriverDetails
      const driver = await db.User.findOne({ where: { uuid } });

      if (!driver) {
        commonHelper.errorMessage("Driver not found", res);
      }

      // Check if driver status already exists
      const getDetails = await db.DriverStatus.findOne({ where: { uuid } });

      commonHelper.successMessage(
        getDetails,
        "Driver status get successfully",
        res
      );

    } catch (error: any) {
      console.error("get Driver Status Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async getRideDetailByIdMerchant(payload: any, res: Response) {
    console.log("getRideDetailById", payload);
    const { uuid, rideId } = payload;

    if (!uuid || !rideId) {
      return commonHelper.errorMessage("Missing ride ID", res);
    }

    try {
      const ride = await db.Rides.findOne({
        where: { id: rideId, driver_id: uuid }
      });

      if (!ride) {
        return commonHelper.errorMessage("Ride not found", res);
      }

      return commonHelper.successMessage({ ride }, "Ride detail", res);
    } catch (error: any) {
      console.error("Ride detail Error:", error);
      return commonHelper.errorMessage("Internal server error: " + error.message, res);
    }
  }

  async cancelRide(payload: any, res: Response) {
    console.log("cancelRide payload:", payload);
    const { uuid, rideId, cancelledVia, cancelReason } = payload;

    if (!uuid || !rideId || !cancelledVia) {
      return commonHelper.errorMessage("Missing required fields", res);
    }

    try {
      // 1. Find ride
      const ride = await db.Rides.findOne({
        where: { id: rideId }
      });

      if (!ride) {
        return commonHelper.errorMessage("Ride not found", res);
      }

      // 2. If already cancelled/completed, don't allow again
      if (["cancelled", "completed"].includes(ride.status)) {
        return commonHelper.errorMessage("Ride already " + ride.status, res);
      }

      // 3. Update status + cancelled fields
      ride.status = "cancelled";
      ride.cancelled_via = cancelledVia; // e.g. "driver" or "passenger"
      ride.cancel_reason = cancelReason || null; // optional
      ride.cancelled_at = new Date();

      await ride.save();

      // 4. Return response
      return commonHelper.successMessage(
        { ride },
        "Ride cancelled successfully",
        res
      );
    } catch (error: any) {
      console.error("Cancel ride Error:", error);
      return commonHelper.errorMessage("Internal server error: " + error.message, res);
    }
  }

  async reachDriver(payload: any, res: Response) {
    console.log("reachDriver payload:", payload);
    const { uuid, rideId, reachedLocation, reachedTiming } = payload;

    if (!uuid || !rideId || !reachedTiming) {
      return commonHelper.errorMessage("Missing required fields", res);
    }

    try {
      // 1. Find the ride
      const ride = await db.Rides.findOne({
        where: { id: rideId, driver_id: uuid },
      });

      if (!ride) {
        return commonHelper.errorMessage("Ride not found", res);
      }

      // 2. Prevent duplicate update
      if (ride.status === "driver_reached") {
        return commonHelper.errorMessage("Driver already reached passenger", res);
      }

      // 3. Update ride with reached details
      ride.status = "driver_reached";

      // ✅ Server-confirmed timestamp
      ride.driver_reached_at = new Date();

      // ✅ Device-reported timestamp
      ride.reached_timing = new Date(reachedTiming);

      // ✅ Save reached location if passed
      ride.reached_location = reachedLocation || null; // should be JSON (lat/lng)

      await ride.save();

      // 4. Return success response
      return commonHelper.successMessage(
        { ride },
        "Driver marked as reached passenger successfully",
        res
      );
    } catch (error: any) {
      console.error("reachDriver Error:", error);
      return commonHelper.errorMessage(
        "Internal server error: " + error.message,
        res
      );
    }
  }

  async startRide(payload: any, res: Response) {
    console.log("startRide payload:", payload);
    const { uuid, rideId, startLocation, deviceStartTime, otp } = payload;

    if (!uuid || !rideId || !otp) {
      return commonHelper.errorMessage("Missing required fields (uuid, rideId, otp)", res);
    }

    try {
      // 1. Find the ride
      const ride = await db.Rides.findOne({
        where: { id: rideId, driver_id: uuid },
      });

      if (!ride) {
        return commonHelper.errorMessage("Ride not found", res);
      }

      // 2. Validate ride state
      if (ride.status !== "driver_reached") {
        return commonHelper.errorMessage(
          `Ride cannot be started. Current status: ${ride.status}`,
          res
        );
      }

      // 3. Validate OTP
      const rideOtp = await db.RideOtps.findOne({
        where: { ride_id: rideId, verified: false },
      });

      if (!rideOtp) {
        return commonHelper.errorMessage("OTP not found or already used", res);
      }

      if (rideOtp.otp !== otp) {
        return commonHelper.errorMessage("Invalid OTP", res);
      }

      // ✅ Transaction: verify OTP + update ride
      await db.sequelize.transaction(async (t: any) => {
        // Mark OTP verified
        rideOtp.verified = true;
        await rideOtp.save({ transaction: t });

        // Update ride
        ride.status = "in_progress";

        // ✅ Use client-side timing only
        if (deviceStartTime) {
          ride.ride_start_at = new Date(deviceStartTime);
        } else {
          // fallback in case client missed it
          ride.ride_start_at = new Date();
        }

        if (startLocation) {
          ride.reached_location = startLocation;
        }

        await ride.save({ transaction: t });
      });

      // 4. Response
      return commonHelper.successMessage(
        { ride, otp_verified: true },
        "Ride started successfully",
        res
      );
    } catch (error: any) {
      console.error("startRide Error:", error);
      return commonHelper.errorMessage("Internal server error: " + error.message, res);
    }
  }

  async getActiveRide(payload: any, res: Response) {
    try {
      const { uuid } = payload;

      if (!uuid) {
        return commonHelper.errorMessage("UUID is required", res);
      }

      // Find user by UUID
      const user = await db.User.findOne({
        where: { uuid },
      });

      if (!user) {
        return commonHelper.errorMessage("User not found", res);
      }

      // Find active ride
      const activeRide = await db.Rides.findOne({
        where: {
          driver_id: uuid,
          status: ["pending", "accepted", "driver_reached", "in_progress"],
        },
        attributes: [
          "id",
          "uuid",
          "driver_id",
          "pickup",
          "destination",
          "status",
          "ride_start_at",
          "ride_end_at",
          "estimated_fare",
          "fare",
        ],
      });

      if (!activeRide) {
        return commonHelper.errorMessage("No active ride found", res);
      }

      return commonHelper.successMessage(activeRide, "Active ride fetched successfully", res);
    } catch (error: any) {
      console.error("Get Active Ride Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async endRide(payload: any, res: Response) {
    try {
      const { uuid, rideId, reachedLocation, reachedTiming } = payload;

      // 1. Validate required fields
      if (!uuid || !rideId || !reachedTiming) {
        return commonHelper.errorMessage(
          "Missing required fields: uuid, rideId, or reachedTiming",
          res
        );
      }

      // 2. Find the ride
      const ride = await db.Rides.findOne({ where: { id: rideId } });
      if (!ride) {
        return commonHelper.errorMessage("Ride not found", res);
      }

      // 3. Only allow if ride is in progress
      if (ride.status !== "in_progress") {
        return commonHelper.errorMessage(
          "Cannot end ride that is not in progress",
          res
        );
      }

      // 4. Update ride details
      ride.status = "completed";
      ride.ride_end_at = new Date(reachedTiming);
      if (reachedLocation) ride.end_location = reachedLocation;

      await ride.save();


       let driverStatus = await db.DriverStatus.findOne({ where: { uuid } });

      if (driverStatus) {
        await driverStatus.update({
          status:"online"
        });
      }

      // 5. Return success
      return commonHelper.successMessage(
        { ride },
        "Ride completed successfully",
        res
      );
    } catch (error: any) {
      console.error("End ride Error:", error);
      return commonHelper.errorMessage(
        "Internal server error: " + error.message,
        res
      );
    }
  }

  async getDriverFinalFare(payload: any, res: Response) {
    try {
      const { uuid, rideId } = payload;

      // 1. Find driver
      const driver = await db.User.findOne({ where: { uuid } });
      if (!driver) return commonHelper.errorMessage("No Driver Found!", res);

      // 2. Find ride
      const ride = await db.Rides.findOne({ where: { id: rideId, driver_id: uuid } });
      if (!ride) return commonHelper.errorMessage("No Ride Found!", res);

      // 3. Fetch pricing settings
      const pricing = await db.PricingSettings.findOne();
      if (!pricing) return commonHelper.errorMessage("Pricing settings not found for driver!", res);

      // 4. Determine pickup and destination
      const pickup = ride.reached_location || ride.pickup;
      const destination = ride.end_location || ride.destination;

      if (!pickup || !destination) return commonHelper.errorMessage("Pickup or destination missing", res);

      // 5. Calculate road distance using Google Maps Directions API
      const directionsResp = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
        params: {
          origin: `${pickup.lat},${pickup.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: MAP_API_KEY,
          mode: "driving"
        }
      });

      if (directionsResp.data.status !== "OK") {
        return commonHelper.errorMessage("Failed to calculate route distance", res);
      }

      const distanceMeters = directionsResp.data.routes[0].legs[0].distance.value;
      const distanceKm = distanceMeters / 1000;

      // 6. Determine price per km (vehicle type logic can be added here)
      let pricePerKm = pricing.price_per_km;
      if (driver.vehicle_type === "sedan") pricePerKm = pricing.sedan_price_per_km;
      else if (driver.vehicle_type === "suv") pricePerKm = pricing.suv_price_per_km;
      else if (driver.vehicle_type === "muv") pricePerKm = pricing.muv_price_per_km;
      else if (driver.vehicle_type === "coupe") pricePerKm = pricing.coupe_price_per_km;
      else if (driver.vehicle_type === "convertible") pricePerKm = pricing.convertible_price_per_km;

      const startPrice = pricing.start_price;

      // 7. Calculate wait time cost
      let waitTimeCost = 0;
      let waitTimeStr = null;

      if (ride.driver_reached_at && ride.ride_start_at) {
        const reachedAt = new Date(ride.driver_reached_at).getTime();
        const startAt = new Date(ride.ride_start_at).getTime();
        const waitMinutes = Math.max(0, (startAt - reachedAt) / (1000 * 60));

        const extraWait = Math.max(0, waitMinutes - pricing.initial_wait_time);
        waitTimeCost = extraWait * pricing.wait_time_cost;

        waitTimeStr = `${waitMinutes.toFixed(2)} min`;
      }

      // 8. Calculate final fare
      const finalFare = startPrice + distanceKm * pricePerKm + waitTimeCost;

      // 9. Update ride table
      ride.fare = finalFare;
      ride.wait_time_cost = waitTimeCost;
      ride.wait_time = waitTimeStr;
      await ride.save();

      // 10. Respond with final fare
      return commonHelper.successMessage(
        {
          rideId: ride.id,
          fare: finalFare,
          distance_km: distanceKm.toFixed(2),
          wait_time: waitTimeStr,
          wait_time_cost: waitTimeCost
        },
        "Driver final fare calculated successfully",
        res
      );
    } catch (error: any) {
      console.error("Get Driver Final Fare Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async getRideHistoryDriver(payload: any, res: Response) {
    console.log("getRideHistory driver", payload);
    const { uuid, page = 1, limit = 10 } = payload;

    const offset = (page - 1) * limit;

    try {
      // Get rides with pagination
      const rides: any = await db.sequelize.query(
        `
      SELECT 
        r.*, 
        ro.otp AS otp, 
        ro.verified AS otp_verified,
        p.first_name, 
        p.last_name,
        hd.contact_phone,
        vd.vehicle_number
      FROM rides r
      LEFT JOIN ride_otps ro 
        ON r.id = ro.ride_id
      LEFT JOIN Users u
        ON r.driver_id = u.uuid
      LEFT JOIN Profiles p 
        ON u.id = p.user_id  
      LEFT JOIN host_details hd 
        ON r.driver_id = hd.uuid
      LEFT JOIN vehicle_details vd 
        ON r.driver_id = vd.uuid
      WHERE r.driver_id = :uuid
      ORDER BY r.created_at DESC
      LIMIT :limit OFFSET :offset
      `,
        {
          replacements: { uuid, limit, offset },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );

      // Count total rides for pagination metadata
      const countResult: any = await db.sequelize.query(
        `
      SELECT COUNT(*) as total 
      FROM rides r
      WHERE r.driver_id = :uuid
      `,
        {
          replacements: { uuid },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );

      const total = countResult?.[0]?.total || 0;

      // Map rides with driver details
      const formattedRides = rides.map((ride: any) => ({
        ...ride,
        driver: ride.driver_id
          ? {
            name: `${ride.first_name || ""} ${ride.last_name || ""}`.trim(),
            phone: ride.contact_phone || null,
            vehicle: ride.vehicle_number || null,
          }
          : null,
      }));

      return commonHelper.successMessage(
        {
          rides: formattedRides,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Ride history",
        res
      );
    } catch (error: any) {
      console.error("Ride history Error:", error);
      return commonHelper.errorMessage(
        "Internal server error: " + error.message,
        res
      );
    }
  }

}


export default new MerchantService();