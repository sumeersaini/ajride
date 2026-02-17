"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface DriverDetailsAttributes {
  uuid?: string;
  license_class: string | null;
  license_number: string | null;

  proof_of_work_eligibility: string | null;
  proof_of_work_eligibility_status: string | null;

  driver_history: string | null;
  driver_history_status: string | null;

  background_check: string | null;
  background_check_status: string | null;

  city_licensing: string | null;
  city_licensing_status: string | null;

  driver_licence: string | null;
  driver_licence_status: string | null;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    UUID: any;
    STRING: any;
  }
) => {
  class DriverDetails extends Model<DriverDetailsAttributes> implements DriverDetailsAttributes {
    uuid!: string;
    license_class!: string | null;
    license_number!: string | null;

    proof_of_work_eligibility!: string | null;
    proof_of_work_eligibility_status!: string | null;

    driver_history!: string | null;
    driver_history_status!: string | null;

    background_check!: string | null;
    background_check_status!: string | null;

    city_licensing!: string | null;
    city_licensing_status!: string | null;

    driver_licence!: string | null;
    driver_licence_status!: string | null;

    static associate(models: any) {
      // Define associations here
      // DriverDetails.belongsTo(models.User, { foreignKey: 'uuid' });
    }
  }

  DriverDetails.init(
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      license_class: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      license_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      proof_of_work_eligibility: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      proof_of_work_eligibility_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0",
      },

      driver_history: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      driver_history_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0",
      },

      background_check: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      background_check_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0",
      },

      city_licensing: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city_licensing_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0",
      },

      driver_licence: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      driver_licence_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0",
      },
    },
    {
      sequelize,
      modelName: "DriverDetails",
      tableName: "driver_details",
      timestamps: true,
    }
  );

  return DriverDetails;
};
