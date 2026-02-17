"use strict";

import { Model, Sequelize, DataTypes } from "sequelize";

interface RideOtpAttributes {
  id?: number;
  ride_id: number;   // FK -> rides.id
  otp: string;       // e.g. "1234"
  verified?: boolean;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    INTEGER: any;
    STRING: any;
    BOOLEAN: any;
  }
) => {
  class RideOtps extends Model<RideOtpAttributes> implements RideOtpAttributes {
    id!: number;
    ride_id!: number;
    otp!: string;
    verified!: boolean;

    static associate(models: any) {
      // each OTP belongs to a Ride
      RideOtps.belongsTo(models.Rides, {
        foreignKey: "ride_id",
        as: "ride",
      });
    }
  }

  RideOtps.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      ride_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "rides",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      otp: {
        type: DataTypes.STRING(6), // can hold "1234" or "678901"
        allowNull: false,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "RideOtps",
      tableName: "ride_otps",
      timestamps: true, // created_at, updated_at
      underscored: true,
    }
  );

  return RideOtps;
};
