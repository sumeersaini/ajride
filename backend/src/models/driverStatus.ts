"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface DriverStatusAttributes {
  uuid: string;
  status?: "online" | "offline" | "busy";
  lat?: number;
  lng?: number;
  current_place?: string | null;
 
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) => {
  class DriverStatus extends Model<DriverStatusAttributes> implements DriverStatusAttributes {
    uuid!: string;
    status!: "online" | "offline" | "busy";
    lat!: number;
    lng!: number;
    current_place!: string | null;
     

    static associate(models: any) {
      // Optionally associate with DriverDetails
      // DriverStatus.belongsTo(models.DriverDetails, { foreignKey: "uuid" });
    }
  }

  DriverStatus.init(
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("online", "offline", "busy"),
        allowNull: false,
        defaultValue: "offline",
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      lng: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      current_place: {
        type: DataTypes.STRING,
        allowNull: true,
      },
     
    },
    {
      sequelize,
      modelName: "DriverStatus",
      tableName: "driver_status",
      timestamps: true,
    }
  );

  return DriverStatus;
};
