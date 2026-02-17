// cron/capturePayments.ts
import db from "../models";
import Stripe from "stripe";
import { QueryTypes } from "sequelize";
import axios from "axios";
const MAP_API_KEY = process.env.MAP_API_KEY;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
});

class cronJob {
   async capturePendingPayments() {
    try {
      console.log("Cron started: Capture pending payments...");

      // 1. Fetch rides with completed status, invoices on hold, cron = 0 or NULL
      const query = `
        SELECT 
          r.id AS rideId,
          r.driver_id,
          r.pickup,
          r.reached_location,
          r.destination,
          r.end_location,
          r.driver_reached_at,
          r.ride_start_at,
          r.fare AS recordedFare,
          i.id AS invoiceId,
          i.amount,
          i.paymentIntent,
          i.status AS invoiceStatus,
          i.cron AS cronFlag
        FROM rides r
        INNER JOIN invoices i ON r.id = i.rideId
        WHERE r.status = 'completed'
          AND i.status = 'hold'
          AND (i.cron IS NULL OR i.cron = 0)
      `;

      const pendingInvoices: Array<any> = await db.sequelize.query(query, { type: QueryTypes.SELECT });
      console.log(`Found ${pendingInvoices.length} invoices to process.`);

      for (const ride of pendingInvoices) {
        try {
          // Mark cron = 1 at the start
          await db.Invoice.update({ cron: 1 }, { where: { id: ride.invoiceId } });

          if (!ride.paymentIntent) {
            console.warn(`Invoice ${ride.invoiceId} has no paymentIntent, skipping capture.`);
            continue;
          }

          // Determine pickup and destination
          const pickup = ride.reached_location || ride.pickup;
          const destination = ride.end_location || ride.destination;

          if (!pickup || !destination) {
            console.warn(`Ride ${ride.rideId} missing pickup/destination, skipping.`);
            continue;
          }

          // Calculate distance using Google Maps API
          const directionsResp = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
            params: {
              origin: `${pickup.lat},${pickup.lng}`,
              destination: `${destination.lat},${destination.lng}`,
              key: MAP_API_KEY,
              mode: "driving",
            },
          });

          if (directionsResp.data.status !== "OK") {
            console.warn(`Failed to calculate distance for ride ${ride.rideId}, skipping.`);
            continue;
          }

          const distanceMeters = directionsResp.data.routes[0].legs[0].distance.value;
          const distanceKm = distanceMeters / 1000;

          // Fetch driver and pricing
          const driver = await db.User.findOne({ where: { uuid: ride.driver_id } });
          const pricing = await db.PricingSettings.findOne();

          if (!driver || !pricing) {
            console.warn(`Driver or pricing not found for ride ${ride.rideId}, skipping.`);
            continue;
          }

          // Price per km by vehicle type
          let pricePerKm = pricing.price_per_km;
          switch (driver.vehicle_type) {
            case "sedan":
              pricePerKm = pricing.sedan_price_per_km;
              break;
            case "suv":
              pricePerKm = pricing.suv_price_per_km;
              break;
            case "muv":
              pricePerKm = pricing.muv_price_per_km;
              break;
            case "coupe":
              pricePerKm = pricing.coupe_price_per_km;
              break;
            case "convertible":
              pricePerKm = pricing.convertible_price_per_km;
              break;
          }

          const startPrice = pricing.start_price;

          // Wait time cost
          let waitTimeCost = 0;
          if (ride.driver_reached_at && ride.ride_start_at) {
            const reachedAt = new Date(ride.driver_reached_at).getTime();
            const startAt = new Date(ride.ride_start_at).getTime();
            const waitMinutes = Math.max(0, (startAt - reachedAt) / (1000 * 60));
            const extraWait = Math.max(0, waitMinutes - pricing.initial_wait_time);
            waitTimeCost = extraWait * pricing.wait_time_cost;
          }

          // Final fare
          const finalFare = startPrice + distanceKm * pricePerKm + waitTimeCost;

          // Skip rides <= 1 km
          if (distanceKm <= 1) {
            console.log(`Ride ${ride.rideId} distance <= 1km, skipping capture.`);
            await db.Rides.update({ fare: finalFare, distance_km: distanceKm, wait_time_cost: waitTimeCost }, { where: { id: ride.rideId } });
            await db.Invoice.update({ amount: finalFare }, { where: { id: ride.invoiceId } });
            continue;
          }

          // Update ride and invoice with final fare
          await db.Rides.update({ fare: finalFare, distance_km: distanceKm, wait_time_cost: waitTimeCost }, { where: { id: ride.rideId } });
          await db.Invoice.update({ amount: finalFare }, { where: { id: ride.invoiceId } });

          // Capture payment
          const paymentIntent = await stripe.paymentIntents.retrieve(ride.paymentIntent);

          if (paymentIntent.status === "requires_capture") {
            await stripe.paymentIntents.capture(paymentIntent.id, {
              amount_to_capture: Math.round(finalFare * 100),
            });
            await db.Invoice.update({ status: "paid", paidAt: new Date() }, { where: { id: ride.invoiceId } });
            console.log(`Payment captured for invoice ${ride.invoiceId}`);
          } else if (paymentIntent.status === "succeeded") {
            console.log(`Invoice ${ride.invoiceId} already captured.`);
          } else {
            console.log(`Invoice ${ride.invoiceId} has PaymentIntent status: ${paymentIntent.status}`);
          }
        } catch (err) {
          console.error(`Error processing ride/invoice ${ride.rideId}/${ride.invoiceId}:`, err);
        }
      }

      console.log("Cron finished: Capture pending payments.");
    } catch (error) {
      console.error("Error in capturePendingPayments cron:", error);
    }
  }
}

export default new cronJob();
