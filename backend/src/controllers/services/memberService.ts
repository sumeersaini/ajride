import db from "../../models";
const { QueryTypes } = require("sequelize");
// const MyQuery = db.sequelize;
import { Request, Response } from 'express';

import commonHelper from "../../helpers/commonHelper";
import { where } from "sequelize";

import axios from "axios";
import { DateTime } from 'luxon';
import { randomInt } from "crypto";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as Stripe.LatestApiVersion, // ✅ cast fixes type error
});

// import { admin } from '../../utils/firebaseAdmin';
import { Op } from 'sequelize';

import { io } from '../../index';
import rideEventBus from "../../utils/events";

const MAP_API_KEY = process.env.MAP_API_KEY;
const ONE_SIGNAL_APP_ID = process.env.ONE_SIGNAL_APP_ID!;
const ONE_SIGNAL_API_KEY = process.env.ONE_SIGNAL_API_KEY!;

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface BookRidePayload {
  uuid: string;        // Passenger UUID
  userId: string;      // Passenger ID
  pickup: Location;
  destination: Location;
  rideDistance: number;
  estimated_fare?: number;
  driverId?: string;   // Pre-selected driver UUID
}

class UserService {

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

  async checkMerchant(payload: any, res: Response) {
    try {
      const { uuid } = payload;

      console.log("inside host request", payload)
      var checkUser = await db.User.findOne({
        where: {
          uuid,
        },
      })

      if (checkUser) {


        return res.status(200).send({
          data: checkUser,
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

  async fetchPricing(payload: any, res: Response) {
    try {

      const {
        uuid
      } = payload;
      const settings = await db.PricingSettings.findOne();

      return commonHelper.successMessage(
        settings,
        "Pricing fetched successfully",
        res
      );
    } catch (error: any) {
      console.error("Fetch Pricing Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  /***new code  */
  // async bookRide(payload: any, res: Response) {
  //   try {
  //     const { uuid, pickup, destination, estimatedFare, rideDistance, driverId } = payload;

  //     const userId = uuid;
  //     if (!userId || !pickup || !destination) {
  //       return commonHelper.errorMessage("Missing booking details", res);
  //     }

  //     // ✅ Step 1: Check if user already has an active ride
  //     const existingRide = await db.Rides.findOne({
  //       where: {
  //         uuid: userId,
  //         status: ["pending", "accepted", "in_progress"] // statuses considered "active"
  //       },
  //       order: [["createdAt", "DESC"]]
  //     });

  //     if (existingRide) {
  //       return res.status(400).send({
  //         success: false,
  //         message: "You already have a ride in progress",
  //         data: { rideId: existingRide.id }
  //       });
  //     }
  //     // Get base pricing from DB
  //     const settings = await db.PricingSettings.findOne();
  //     const baseFare = settings?.start_price || 3;
  //     const defaultRate = settings?.price_per_km || 2;

  //     // Create a ride record with status 'pending'
  //     const ride = await db.Rides.create({
  //       uuid: userId,
  //       pickup,
  //       destination,
  //       estimated_fare: estimatedFare,
  //       start_price: baseFare,
  //       price_per_km: defaultRate,
  //       status: "pending",
  //       request_sent_at: new Date(),
  //       driver_id: driverId || null
  //     });

  //     console.log(`Ride ${ride.id} created`);

  //     // Respond immediately to frontend
  //     res.status(200).send({
  //       success: true,
  //       message: "Ride request created, searching for driver...",
  //       data: { rideId: ride.id }
  //     });

  //     // Continue searching for driver asynchronously
  //     this.assignDriver(ride, rideDistance, pickup, destination, driverId);

  //   } catch (error: any) {
  //     console.error("Book Ride Error:", error);
  //     return commonHelper.errorMessage(`Error: ${error.message}`, res);
  //   }
  // }

  async bookRide(payload: any, res: Response) {
    try {
      const { uuid, pickup, destination, estimatedFare, rideDistance, driverId, paymentMethodId } = payload;

      if (!uuid || !pickup || !destination || !estimatedFare || !paymentMethodId) {
        return commonHelper.errorMessage("Missing booking details or payment method", res);
      }

      // Step 1: Ensure Stripe customer exists
      const stripeUser: any = await this.createStripeCustomer({ uuid, paymentMethodId });

      if (!stripeUser.success) {
        // Only fail if there is a real error (user not found, missing email/phone, etc.)
        return commonHelper.errorMessage(stripeUser.message, res);
      }

      // Use existing or newly created Stripe customer
      const stripeCustomerId = stripeUser.data?.stripeCustomerId;
      if (!stripeCustomerId) {
        return commonHelper.errorMessage("Failed to retrieve Stripe customer ID", res);
      }

      // Step 2: Check for active ride
      const existingRide = await db.Rides.findOne({
        where: { uuid, status: ["pending", "accepted", "in_progress"] },
        order: [["createdAt", "DESC"]],
      });

      if (existingRide) {
        return res.status(400).send({ success: false, message: "Active ride exists", data: { rideId: existingRide.id } });
      }

      // Step 3: Create temporary invoice & hold payment
      const invoiceUuid = crypto.randomUUID();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(estimatedFare * 100),
        currency: "CAD",
        capture_method: "manual",
        payment_method_types: ["card"],
        customer: stripeCustomerId,
        description: `Hold payment for ride (passenger: ${uuid})`,
      });

      const invoice = await db.Invoice.create({
        uuid: invoiceUuid,
        rideId: null, // update after ride creation
        merchantUuid: driverId || null,
        amount: estimatedFare,
        currency: "CAD",
        status: "hold",
        paymentIntent: paymentIntent.id,
        issuedAt: new Date(),
      });

      // Step 4: Create ride
      const settings = await db.PricingSettings.findOne();
      const baseFare = settings?.start_price || 3;
      const defaultRate = settings?.price_per_km || 2;

      const ride = await db.Rides.create({
        uuid,
        pickup,
        destination,
        estimated_fare: estimatedFare,
        start_price: baseFare,
        price_per_km: defaultRate,
        status: "pending",
        request_sent_at: new Date(),
        driver_id: driverId || null,
      });

      // Link invoice to ride
      await invoice.update({ rideId: ride.id });

      // Step 5: Respond
      res.status(200).send({
        success: true,
        message: "Ride request created, searching for driver...",
        data: { rideId: ride.id, invoiceId: invoice.uuid, paymentIntentClientSecret: paymentIntent.client_secret },
      });

      // Step 6: Assign driver asynchronously
      this.assignDriver(ride, rideDistance, pickup, destination, driverId);

    } catch (error: any) {
      console.error("Book Ride Error:", error);
      return commonHelper.errorMessage(error.message, res);
    }
  }

  private async assignDriver(
  ride: any, // You can replace `any` with your Ride model type
  distance: number,
  pickup: Location,
  destination: Location,
  preferredDriverId?: string
): Promise<void> {
  let triedDrivers: string[] = [];
  const driverSearchOrder = preferredDriverId ? [preferredDriverId] : [];

  while (true) {
    const nextDriver = driverSearchOrder.length
      ? await db.DriverStatus.findOne({
          where: { uuid: driverSearchOrder.shift(), status: "online" },
        })
      : await this.findNearestDriver(pickup, triedDrivers);

    // No more drivers available
    if (!nextDriver) break;

    triedDrivers.push(nextDriver.uuid);

    const pricing = await this.getPricing(nextDriver.uuid);
    const fare = this.calculateFare(distance, pricing.start_price, pricing.price_per_km);

    await ride.update({
      driver_id: nextDriver.uuid,
      start_price: pricing.start_price,
      price_per_km: pricing.price_per_km,
      estimated_fare: fare,
      request_sent_at: new Date(),
      status: "pending",
    });

    await db.DriverStatus.update({ status: "busy" }, { where: { uuid: nextDriver.uuid } });

    const driverNotifications: { push_token: string | null }[] = await db.Notification.findAll({
      where: { uuid: nextDriver.uuid },
    });

    if (!driverNotifications || driverNotifications.length === 0) {
      console.log("❌ No tokens found for driver", nextDriver.uuid);
      // Skip to next driver if no tokens
      await db.DriverStatus.update({ status: "online" }, { where: { uuid: nextDriver.uuid } });
      continue;
    }

    // Send notifications to all tokens
    await Promise.all(
      driverNotifications.map((notif: { push_token: string | null }) => {
        if (notif.push_token) {
          console.log("📩 Sending to driver token:", notif.push_token);
          return this.notifyDriver(nextDriver, ride, fare, notif.push_token).catch(console.error);
        }
        return Promise.resolve();
      })
    );

    // Wait for driver to accept/reject (20s timeout)
    const accepted = await this.waitForDriverResponse(ride.id, nextDriver.uuid, 20000);

    if (accepted) {
      // ✅ Driver accepted → acceptRide API will emit socket update
      return;
    }

    // Driver rejected or timed out → reset status
    await db.DriverStatus.update({ status: "online" }, { where: { uuid: nextDriver.uuid } });

    console.log(`Driver ${nextDriver.uuid} rejected/timed out, searching next...`);
  }

  // No drivers left → notify passenger
  console.log("No driver available for this ride");
  await ride.update({ status: "no_driver_available" });

  // Socket update to passenger
  io.to(`ride_${ride.id}`).emit("ride_update", {
    rideId: ride.id,
    status: "no_driver_available",
  });
}



  private async notifyPassenger(passengerId: string, data: any) {
    const passenger = await db.User.findOne({ where: { uuid: passengerId } });
    if (!passenger?.push_token) return;

    await this.sendPushNotification(
      [passenger.push_token],
      "Ride Update",
      "Your ride status changed",
      data
    );
  }


  private async getPricing(driverId: any) {
    //get default pricing
    const settings = await db.PricingSettings.findOne();

    const baseFare = settings.start_price;
    const defaultRatePerKm = settings.price_per_km;
    const sedanRatePerKm = settings.sedan_price_per_km;
    const suvRatePerKm = settings.suv_price_per_km;
    const muvRatePerKm = settings.muv_price_per_km;
    const coupeRatePerKm = settings.coupe_price_per_km;
    const convertibleRatePerKm = settings.convertible_price_per_km;

    const driverVehicle = await db.VehicleDetails.findOne({ where: { uuid: driverId } })

    let ratePerKm = defaultRatePerKm;
    if (driverVehicle.vehicle_type == "sedans") {
      ratePerKm = sedanRatePerKm;
    } else if (driverVehicle.vehicle_type == "SUVs") {
      ratePerKm = suvRatePerKm;
    } else if (driverVehicle.vehicle_type == "MUVs") {
      ratePerKm = muvRatePerKm;
    } else if (driverVehicle.vehicle_type == "coupes") {
      ratePerKm = coupeRatePerKm;
    } else if (driverVehicle.vehicle_type == "convertibles") {
      ratePerKm = convertibleRatePerKm;
    }

    return { start_price: baseFare, price_per_km: ratePerKm };
  }

  private calculateFare(distance: number, base: number, rate: number) {
    return parseFloat((base + rate * distance).toFixed(2));
  }

  // Updated notifyDriver function with correct data payload
  private async notifyDriver(driver: any, ride: any, fare: number, push_token: any) {
    const title = "New Ride Request";
    const body = `Pickup: ${ride.pickup.name} → ${ride.destination.name} | Fare: $${fare}`;

    // ✅ Wrap your ride data inside a 'payload' object
    // and add a 'type' field to identify the notification on the client
    const data = {
      type: "ride_request",
      payload: {
        rideId: String(ride.id),
        driverId: String(driver.uuid),
        fare: String(fare),
        pickupLat: String(ride.pickup.lat),
        pickupLng: String(ride.pickup.lng),
        destLat: String(ride.destination.lat),
        destLng: String(ride.destination.lng),
        pickupName: String(ride.pickup.name),
        destinationName: String(ride.destination.name),
        action: "ride_request" // 'action' is also fine for extra context
      }
    };

    await this.sendPushNotification([push_token], title, body, data);
  }

  private async findNearestDriver(pickup: Location, exclude: string[]) {
    // TODO: Implement geospatial nearest driver query
    return null;
  }

  private async waitForDriverResponse(
    rideId: number,
    driverId: string,
    timeoutMs: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const eventKey = `ride_response_${rideId}_${driverId}`;

      const listener = (accepted: boolean) => {
        clearTimeout(timer);
        rideEventBus.off(eventKey, listener);
        resolve(accepted);
      };

      const timer = setTimeout(() => {
        rideEventBus.off(eventKey, listener);
        resolve(false); // timeout → treat as rejected
      }, timeoutMs);

      rideEventBus.once(eventKey, listener);
    });
  }

  /**end new code */

  async acceptRide(payload: any, res: Response) {
    console.log("acceptRide", payload);
    const { uuid: driverUuid, rideId } = payload;

    if (!driverUuid || !rideId) {
      return commonHelper.errorMessage("Missing driver UUID or ride ID", res);
    }

    const t = await db.sequelize.transaction();
    try {
      const ride = await db.Rides.findOne({
        where: { id: rideId, driver_id: driverUuid, status: "pending" },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!ride) {
        await t.rollback();
        return commonHelper.errorMessage("Ride not available for accept", res);
      }

      // 1. Update ride status
      await ride.update(
        { status: "accepted", accepted_at: new Date() },
        { transaction: t }
      );

      // 2. Update driver status
      const driverUpdate = await db.DriverStatus.update(
        { status: "busy" },
        { where: { uuid: driverUuid }, transaction: t }
      );

      if (driverUpdate[0] === 0) {
        await t.rollback();
        return commonHelper.errorMessage("Driver not found", res);
      }

      // 3. Generate OTP (4-digit numeric)
      const otp = String(randomInt(1000, 9999)); // e.g. "4821"

      // 4. Save OTP in ride_otps table
      await db.RideOtps.create(
        {
          ride_id: rideId,
          otp: otp,
          verified: false,
        },
        { transaction: t }
      );

      await t.commit();

      // 🔑 Emit to event bus
      const eventKey = `ride_response_${rideId}_${driverUuid}`;
      rideEventBus.emit(eventKey, true);

      // 🔑 Emit to frontend sockets (passenger/client apps)
      io.to(`ride_${rideId}`).emit("ride_assigned", {
        rideId: ride.id,
        driver: {
          id: ride.driver_id,
          name: ride.driver?.name || "Assigned Driver",
          vehicle: ride.driver?.vehicle_type || null,
        },
        status: "accepted",
        otp: otp, // 🔑 send OTP to passenger app
      });

      return commonHelper.successMessage({ rideId, otp }, "Ride accepted", res);
    } catch (error: any) {
      await t.rollback();
      console.error("acceptRide Error:", error);
      return commonHelper.errorMessage("Internal server error: " + error.message, res);
    }
  }

  // Reject Ride
  async rejectRide(payload: any, res: Response) {
    const t = await db.sequelize.transaction();
    try {
      const { uuid: driverUuid, rideId } = payload;

      const ride = await db.Rides.findOne({
        where: { id: rideId, driver_id: driverUuid, status: "pending" },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!ride) {
        await t.rollback();
        return commonHelper.errorMessage("Ride not available for reject", res);
      }

      await ride.update(
        { status: "expired", rejected_at: new Date() },
        { transaction: t }
      );

      await db.DriverStatus.update(
        { status: "online" },
        { where: { uuid: driverUuid }, transaction: t }
      );

      await t.commit();

      // 🔑 Emit to event bus (backend promise resolution)
      const eventKey = `ride_response_${rideId}_${driverUuid}`;
      rideEventBus.emit(eventKey, false);

      // 🔑 Emit to frontend sockets
      io.to(`ride_${rideId}`).emit("ride_update", {
        rideId: ride.id,
        status: "searching",
      });

      return commonHelper.successMessage({ rideId }, "Ride rejected", res);
    } catch (error: any) {
      await t.rollback();
      console.error("rejectRide Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async sendPushNotification(
    playerIds: string[],
    title: string,
    body: string,
    data: any = {}
  ) {
    try {
      const response = await axios.post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: ONE_SIGNAL_APP_ID,
          include_player_ids: playerIds, // must be real playerIds from frontend
          headings: { en: title || "Notification" },
          contents: { en: body || "" },
          data,
          "url": "about:blank",
          // extra fields that help debugging
          channel_for_external_user_ids: "push",
          priority: 10, // boost delivery for Android
        },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Basic ${ONE_SIGNAL_API_KEY}`, // REST API Key, not App ID
          },
        }
      );

      console.log("✅ OneSignal push sent:", response.data);
    } catch (err: any) {
      console.error(
        "❌ OneSignal push error:",
        err.response?.data || err.message
      );
    }
  }


  async notifyPassengerRideStatus(rideId: number, status: string) {
    const ride = await db.Rides.findOne({
      where: { id: rideId },
      include: [
        { model: db.Users, as: "passenger", attributes: ["id", "push_token", "name"] },
        { model: db.Users, as: "driver", attributes: ["id", "name"] }
      ]
    });

    if (!ride || !ride.passenger?.push_token) return;

    let title = "";
    let body = "";

    switch (status) {
      case "pending":
        title = "Finding your driver...";
        body = "We are searching for the nearest available driver.";
        break;
      case "accepted":
        title = "Driver confirmed!";
        body = `${ride.driver?.name || "Your driver"} is on the way.`;
        break;
      case "searching":
        title = "Searching again...";
        body = "Looking for another driver nearby.";
        break;
      case "no_driver_available":
        title = "No drivers available";
        body = "Sorry, we couldn't find a driver right now.";
        break;
    }

    await this.sendPushNotification(
      [ride.passenger.push_token],
      title,
      body,
      {
        rideId: String(ride.id),
        status,
        driverId: ride.driverId ? String(ride.driverId) : "",
      }
    );
  }


  // async getRideDetailById(payload: any, res: Response) {
  //   console.log("getRideDetailById", payload);
  //   const { uuid: userUuid, rideId } = payload;

  //   if (!userUuid || !rideId) {
  //     return commonHelper.errorMessage("Missing ride ID", res);
  //   }

  //   try {
  //     const [results]: any = await db.sequelize.query(
  //       `
  //     SELECT 
  //       r.*, 
  //       ro.otp AS otp, 
  //       ro.verified AS otp_verified
  //     FROM rides r
  //     LEFT JOIN ride_otps ro ON r.id = ro.ride_id
  //     WHERE r.id = :rideId AND r.uuid = :userUuid
  //     LIMIT 1
  //     `,
  //       {
  //         replacements: { rideId, userUuid },
  //         type: db.Sequelize.QueryTypes.SELECT,
  //       }
  //     );

  //     if (!results) {
  //       return commonHelper.errorMessage("Ride not found", res);
  //     }

  //     return commonHelper.successMessage({ ride: results }, "Ride detail", res);
  //   } catch (error: any) {
  //     console.error("Ride detail Error:", error);
  //     return commonHelper.errorMessage("Internal server error: " + error.message, res);
  //   }
  // }

  async getRideDetailById(payload: any, res: Response) {
    console.log("getRideDetailById", payload);
    const { uuid: userUuid, rideId } = payload;

    if (!userUuid || !rideId) {
      return commonHelper.errorMessage("Missing ride ID", res);
    }

    try {
      const [results]: any = await db.sequelize.query(
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
        ON u.id = p.user_id   -- ✅ FIXED HERE
      LEFT JOIN host_details hd 
        ON r.driver_id = hd.uuid
      LEFT JOIN vehicle_details vd 
        ON r.driver_id = vd.uuid
      WHERE r.id = :rideId 
        AND r.uuid = :userUuid
      LIMIT 1
      `,
        {
          replacements: { rideId, userUuid },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );

      if (!results) {
        return commonHelper.errorMessage("Ride not found", res);
      }

      const ride = {
        ...results,
        driver: results.driver_id
          ? {
            name: `${results.first_name || ""} ${results.last_name || ""}`.trim(),
            phone: results.contact_phone || null,
            vehicle: results.vehicle_number || null,
          }
          : null,
      };

      return commonHelper.successMessage({ ride }, "Ride detail", res);
    } catch (error: any) {
      console.error("Ride detail Error:", error);
      return commonHelper.errorMessage("Internal server error: " + error.message, res);
    }
  }

  async getNearbyDrivers(payload: any, res: Response) {
    try {
      const { uuid, lat, lng, radius = 15, ride_distance, timezone = "UTC" } = payload;

      if (!lat || !lng) {
        return commonHelper.errorMessage("lat and lng are required", res);
      }

      const settings = await db.PricingSettings.findOne();

      if (!settings) {
        return commonHelper.errorMessage("Error: Unable to get ride now!", res);
      }

      const nearestDrivers = await db.sequelize.query(
        `
      SELECT ds.*, vd.vehicle_type,
        (6371 * acos(
          cos(radians(:lat)) * cos(radians(ds.lat)) *
          cos(radians(ds.lng) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(ds.lat))
        )) AS distance
      FROM driver_status AS ds
      JOIN vehicle_details AS vd ON ds.uuid = vd.uuid
      WHERE ds.status = 'online'
      HAVING distance <= :radius
      ORDER BY distance ASC
      LIMIT 10
      `,
        {
          replacements: {
            lat: parseFloat(lat as string),
            lng: parseFloat(lng as string),
            radius: parseFloat(radius as string),
          },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );

      const baseFare = settings.start_price;
      const defaultRatePerKm = settings.price_per_km;

      const sedanRatePerKm = settings.sedan_price_per_km;

      const suvRatePerKm = settings.suv_price_per_km;

      const muvRatePerKm = settings.muv_price_per_km;

      const coupeRatePerKm = settings.coupe_price_per_km;
      const convertibleRatePerKm = settings.convertible_price_per_km;


      const enhancedDrivers = await Promise.all(
        nearestDrivers.map(async (driver: any, index: number) => {
          const { duration, durationValue } = await this.getTravelTimeAndDistance(
            parseFloat(driver.lat),
            parseFloat(driver.lng),
            parseFloat(lat),
            parseFloat(lng)
          );
          let ratePerKm = defaultRatePerKm;

          if (driver.vehicle_type == "sedans") {
            ratePerKm = sedanRatePerKm;
          } else if (driver.vehicle_type == "SUVs") {
            ratePerKm = suvRatePerKm;
          } else if (driver.vehicle_type == "MUVs") {
            ratePerKm = muvRatePerKm;
          } else if (driver.vehicle_type == "coupes") {
            ratePerKm = coupeRatePerKm;
          } else if (driver.vehicle_type == "convertibles") {
            ratePerKm = convertibleRatePerKm;
          }

          const fare = baseFare + ride_distance * ratePerKm;
          const originalFare = fare * 1.3; //this is used for discount show and extra amount without discount;

          const etaMins = Math.ceil(durationValue / 60);

          // Convert ETA to time in client's timezone
          const arrivalTime = DateTime.utc()
            .plus({ minutes: etaMins })
            .setZone(timezone)
            .toFormat('hh:mm a'); // You can use 'HH:mm' for 24-hour format

          return {
            id: index + 1,
            uuid: driver.uuid,
            type: driver.vehicle_type || "Sedan",
            fare: parseFloat(fare.toFixed(2)),
            originalFare: parseFloat(originalFare.toFixed(2)),
            eta: duration, // "8 mins"
            arrivalTime: arrivalTime, // "03:24 PM"
            desc: driver.current_place || "Comfortable ride",
            discount: 30,
            ...driver,
          };
        })
      );

      commonHelper.successMessage(enhancedDrivers, "Nearest drivers found", res);

    } catch (error: any) {
      console.error("Get Nearby Drivers Error:", error);
      commonHelper.errorMessage("Error: " + error.message, res);
    }
  }

  async getTravelTimeAndDistance(originLat: number, originLng: number, destLat: number, destLng: number) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${MAP_API_KEY}`;

      const response = await axios.get(url);
      console.log(response, "response api google")
      const data = response.data;

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        const duration = data.rows[0].elements[0].duration.text; // e.g., "8 mins"
        const distance = data.rows[0].elements[0].distance.text; // e.g., "3.2 km"
        const durationValue = data.rows[0].elements[0].duration.value; // in seconds
        return { duration, distance, durationValue };
      } else {
        throw new Error("Could not get distance/duration from Google API");
      }
    } catch (error: any) {
      console.log("error from google", error)
      throw new Error("Could not get distance/duration from Google API");
    }

  }

  async addPushNotification(payload: any, res: Response) {
    console.log("saveNotificationToken", payload);
    const { uuid: driverUuid, push_token, platform, browser } = payload;

    if (!driverUuid || !push_token) {
      return commonHelper.errorMessage("Missing driver UUID or push token", res);
    }

    const t = await db.sequelize.transaction();
    try {
      // Check if token already exists (unique by push_token)
      let tokenRecord = await db.Notification.findOne({
        where: { push_token },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (tokenRecord) {
        // Update existing record with latest driver + platform + browser
        await tokenRecord.update(
          { uuid: driverUuid, platform, browser },
          { transaction: t }
        );
      } else {
        // Create new record
        tokenRecord = await db.Notification.create(
          { uuid: driverUuid, push_token, platform, browser },
          { transaction: t }
        );
      }

      await t.commit();
      return commonHelper.successMessage(
        tokenRecord,
        "Notification token saved successfully",
        res
      );
    } catch (error: any) {
      await t.rollback();
      console.error("saveNotificationToken Error:", error);
      return commonHelper.errorMessage(
        "Internal server error: " + error.message,
        res
      );
    }
  }

  async removePushNotification(payload: any, res: Response) {
    console.log("remove_push_notification", payload);
    const { uuid: driverUuid, platform, browser } = payload;

    if (!driverUuid || !browser) {
      return commonHelper.errorMessage("Missing driver UUID or browser", res);
    }

    const t = await db.sequelize.transaction();
    try {
      const tokenRecord = await db.Notification.findOne({
        where: { uuid: driverUuid, platform, browser },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!tokenRecord) {
        await t.rollback();
        return commonHelper.errorMessage("Notification token not found", res);
      }

      await tokenRecord.destroy({ transaction: t });
      await t.commit();

      return commonHelper.successMessage(
        null,
        "Notification token removed successfully",
        res
      );
    } catch (error: any) {
      await t.rollback();
      console.error("remove_push_notification Error:", error);
      return commonHelper.errorMessage("Internal server error: " + error.message, res);
    }
  }

  async getActiveRidePassenger(payload: any, res: Response) {
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
          uuid: uuid,
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

  async getPassengerFinalFare(payload: any, res: Response) {
    try {
      const { uuid, rideId } = payload;

      // 1. Find passenger
      const passenger = await db.User.findOne({ where: { uuid } });
      if (!passenger) return commonHelper.errorMessage("No Passenger Found!", res);

      // 2. Find ride for this passenger
      const ride = await db.Rides.findOne({ where: { id: rideId, uuid: uuid } });
      if (!ride) return commonHelper.errorMessage("No Ride Found!", res);

      // 3. Fetch pricing settings
      const pricing = await db.PricingSettings.findOne();
      if (!pricing) return commonHelper.errorMessage("Pricing settings not found!", res);

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

      // 6. Determine price per km (vehicle type logic from ride)
      let pricePerKm = pricing.price_per_km;
      if (ride.vehicle_type === "sedan") pricePerKm = pricing.sedan_price_per_km;
      else if (ride.vehicle_type === "suv") pricePerKm = pricing.suv_price_per_km;
      else if (ride.vehicle_type === "muv") pricePerKm = pricing.muv_price_per_km;
      else if (ride.vehicle_type === "coupe") pricePerKm = pricing.coupe_price_per_km;
      else if (ride.vehicle_type === "convertible") pricePerKm = pricing.convertible_price_per_km;

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
        "Passenger final fare calculated successfully",
        res
      );

    } catch (error: any) {
      console.error("Get Passenger Final Fare Error:", error);
      return commonHelper.errorMessage("Error: " + error.message, res);
    }
  }


  async getRideHistory(payload: any, res: Response) {
    console.log("getRideHistory", payload);
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
      WHERE r.uuid = :uuid
      ORDER BY r.created_at DESC
      LIMIT :limit OFFSET :offset
      `,
        {
          replacements: { uuid, limit, offset },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );

      // Count total rides
      const countResult: any = await db.sequelize.query(
        `
      SELECT COUNT(*) as total 
      FROM rides r
      WHERE r.uuid = :uuid
      `,
        {
          replacements: { uuid },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );

      const total = countResult[0]?.total || 0;

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

  async createStripeCustomer(payload: any) {
    try {
      const { uuid, paymentMethodId } = payload;
      if (!uuid || !paymentMethodId) {
        return { success: false, message: "UUID and paymentMethodId are required" };
      }

      // Find user
      const user = await db.User.findOne({ where: { uuid } });
      if (!user) return { success: false, message: "User not found" };

      const email = user.email || undefined;
      const phone = !email ? user.phone || undefined : undefined;
      if (!email && !phone) return { success: false, message: "User must have email or phone" };

      // Check existing StripeUser
      let stripeUser = await db.StripeUser.findOne({ where: { uuid } });
      let customerId = stripeUser?.stripe_customer;

      if (!customerId) {
        // Create new Stripe customer
        const customer = await stripe.customers.create({ email, phone, metadata: { user_uuid: uuid } });
        customerId = customer.id;

        // Save StripeUser in DB
        stripeUser = await db.StripeUser.create({ uuid, stripe_customer: customerId });
      }

      // Retrieve the new payment method
      const newPM = await stripe.paymentMethods.retrieve(paymentMethodId);

      // List all existing cards for the customer
      const existingMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });

      // Check if the card is already attached
      const duplicateCard = existingMethods.data.find(
        (pm) => pm.card?.fingerprint && newPM.card?.fingerprint && pm.card.fingerprint === newPM.card.fingerprint
      );
      if (!duplicateCard) {
        // Attach payment method and set as default
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
      }

      return { success: true, data: { stripeCustomerId: customerId }, message: "Stripe customer ready" };
    } catch (error: any) {
      console.error("Stripe Customer Error:", error);
      return { success: false, message: error.message };
    }
  }



  async capturePayment(payload: any, res: Response) {
    try {
      const { uuid, rideId, finalAmount } = payload;

      if (!rideId || !finalAmount) {
        return commonHelper.errorMessage("rideId and finalAmount are required", res);
      }

      const invoice = await db.Invoice.findOne({ where: { rideId } });
      if (!invoice) return commonHelper.errorMessage("Invoice not found", res);

      // Retrieve PaymentIntent
      const paymentIntent = await stripe.paymentIntents.retrieve(invoice.paymentIntent);

      switch (paymentIntent.status) {
        case "succeeded":
          return commonHelper.successMessage({ invoice }, "Payment already captured", res);

        case "requires_capture":
          // Capture the held payment
          const capturedPayment = await stripe.paymentIntents.capture(paymentIntent.id, {
            amount_to_capture: Math.round(finalAmount * 100),
          });
          await invoice.update({ amount: finalAmount, status: "paid", paidAt: new Date() });
          return commonHelper.successMessage(
            { paymentIntent: capturedPayment, invoice },
            "Payment captured successfully",
            res
          );

        default:
          // If final amount > hold or other status, cancel and create new PaymentIntent
          await stripe.paymentIntents.cancel(invoice.paymentIntent);

          const newPaymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(finalAmount * 100),
            currency: "CAD",
            capture_method: "automatic",
            description: `Final charge for ride #${rideId}`,
          });

          await invoice.update({
            amount: finalAmount,
            status: "paid",
            paidAt: new Date(),
            paymentIntent: newPaymentIntent.id,
          });

          return commonHelper.successMessage(
            { paymentIntent: newPaymentIntent, invoice },
            "New payment captured successfully",
            res
          );
      }
    } catch (error: any) {
      console.error("Capture Payment Error:", error);
      return commonHelper.errorMessage(error.message, res);
    }
  }



}


export default new UserService();