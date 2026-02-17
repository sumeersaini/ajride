"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface DriverStatusAttributes {
  uuid: string;
  push_token: string | null;
  platform: string | null;
  browser: string | null;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) => {
  class DriverStatus extends Model<DriverStatusAttributes> implements DriverStatusAttributes {
    uuid!: string;
    push_token!: string | null;
    platform!: string | null;
    browser!: string | null;

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
      
      },
      push_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      platform: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      browser: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notification_token",
      timestamps: true,
    }
  );

  return DriverStatus;
};
