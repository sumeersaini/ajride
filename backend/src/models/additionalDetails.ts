"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface AdditionalDetailsAttributes {
  uuid?: string;
  hst_number: string | null;
  hst_number_status: string | null;

  direct_deposit: string | null;
  direct_deposit_status: string | null;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    UUID: any;
    STRING: any;
  }
) => {
  class AdditionalDetails extends Model<AdditionalDetailsAttributes> implements AdditionalDetailsAttributes {
    uuid!: string;
    hst_number!: string | null;
    hst_number_status!: string | null;

    direct_deposit!: string | null;
    direct_deposit_status!: string | null;

    static associate(models: any) {
      // Define associations here if necessary
    }
  }

  AdditionalDetails.init(
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hst_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      hst_number_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0",
      },
      direct_deposit: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      direct_deposit_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0",
      },
    },
    {
      sequelize,
      modelName: "AdditionalDetails",
      tableName: "additional_details",
      timestamps: true,
    }
  );

  return AdditionalDetails;
};
