"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface VehicleDetailsAttributes {
  uuid?: string;
  vehicle_number: string | null;
  vehicle_type:string | null;
  vehicle_registration: string | null;
  vehicle_registration_status: string | null;

  insurance_information: string | null;
  insurance_information_status: string | null;

  safety_inspection: string | null;
  safety_inspection_status: string | null;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    UUID: any;
    STRING: any;
  }
) => {
  class VehicleDetails extends Model<VehicleDetailsAttributes> implements VehicleDetailsAttributes {
    uuid!: string;
    vehicle_number!: string | null;
    vehicle_type!: string | null;

    vehicle_registration!: string | null;
    vehicle_registration_status!: string | null;

    insurance_information!: string | null;
    insurance_information_status!: string | null;

    safety_inspection!: string | null;
    safety_inspection_status!: string | null;

    static associate(models: any) {
      // Define associations here if needed
    }
  }

  VehicleDetails.init(
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vehicle_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vehicle_type:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      vehicle_registration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vehicle_registration_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0",
      },

      insurance_information: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      insurance_information_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0",
      },

      safety_inspection: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      safety_inspection_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0",
      },
    },
    {
      sequelize,
      modelName: "VehicleDetails",
      tableName: "vehicle_details",
      timestamps: true,
    }
  );

  return VehicleDetails;
};
