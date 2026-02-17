"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface RideAttributes {
  id?: number;
  uuid: string;
  driver_id?: string | null;
  pickup: object;
  destination: object;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "expired"
    | "no_driver_available"
    | "driver_reached"
    | "in_progress"
    | "completed"
    | "cancelled";
  request_sent_at?: Date | null;
  accepted_at?: Date | null;
  driver_reached_at?: Date | null;
  reached_location?: object | null;
  cancelled_via?: "driver" | "passenger" | "system" | null;
  cancelled_at?: Date | null;
  cancel_reason?: string | null;  // ✅ NEW COLUMN
  ride_start_at?: Date | null;
  ride_end_at?: Date | null;
  end_location?: object | null;
  reached_timing?: Date | null;
  estimated_fare?: number | null;
  fare?: number | null;
  start_price?: number | null;
  price_per_km?: number | null;
  wait_time_cost?: number | null;
  wait_time?: string | null;
  cancel_fees?: number | null;
  platform_commission?: number | null;
  discount?: number | null;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    INTEGER: any;
    STRING: any;
    JSON: any;
    ENUM: any;
    DATE: any;
    FLOAT: any;
  }
) => {
  class Rides extends Model<RideAttributes> implements RideAttributes {
    id!: number;
    uuid!: string;
    driver_id!: string | null;
    pickup!: object;
    destination!: object;
    status!:
      | "pending"
      | "accepted"
      | "rejected"
      | "expired"
      | "no_driver_available"
      | "driver_reached"
      | "in_progress"
      | "completed"
      | "cancelled";
    request_sent_at!: Date | null;
    accepted_at!: Date | null;
    driver_reached_at!: Date | null;
    reached_location!: object | null;
    cancelled_via!: "driver" | "passenger" | "system" | null;
    cancelled_at!: Date | null;
    cancel_reason!: string | null; // ✅ NEW FIELD
    ride_start_at!: Date | null;
    ride_end_at!: Date | null;
    end_location!: object | null;
    reached_timing!: Date | null;
    estimated_fare!: number | null;
    fare!: number | null;
    start_price!: number | null;
    price_per_km!: number | null;
    wait_time_cost!: number | null;
    wait_time!: string | null;
    cancel_fees!: number | null;
    platform_commission!: number | null;
    discount!: number | null;

    static associate(models: any) {
      // Define associations here if needed
    }
  }

  Rides.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      driver_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pickup: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      destination: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "accepted",
          "rejected",
          "expired",
          "no_driver_available",
          "driver_reached",
          "in_progress",
          "completed",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      request_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      driver_reached_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reached_location: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      reached_timing: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ride_start_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ride_end_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_location:{
        type: DataTypes.JSON,
        allowNull: true,
      },
      cancelled_via: {
        type: DataTypes.ENUM("driver", "passenger", "system"),
        allowNull: true,
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancel_reason: {                // ✅ NEW COLUMN
        type: DataTypes.STRING,
        allowNull: true,
      },
      estimated_fare: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      fare: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      start_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      price_per_km: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      wait_time_cost: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      wait_time: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cancel_fees: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      platform_commission: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      discount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Rides",
      tableName: "rides",
      timestamps: true,
      underscored: true,
    }
  );

  return Rides;
};
