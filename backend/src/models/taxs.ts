"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface TaxAttributes {
  uuid?: string;
  tax_name: string | null;
  tax_type: string | null;
  city: string | null;
  tax_percentage: string | null;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    UUID: any;
    STRING: any;
  }
) => {
  class Tax extends Model<TaxAttributes> implements TaxAttributes {
    uuid!: string;
    tax_name!: string | null;
    tax_type!: string | null;
    city!: string | null;
    tax_percentage!: string | null;

    static associate(models: any) {
      // Define associations here if needed
    }
  }

  Tax.init(
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tax_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tax_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tax_percentage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Tax",
      tableName: "taxs",
      timestamps: true,
    }
  );

  return Tax;
};
