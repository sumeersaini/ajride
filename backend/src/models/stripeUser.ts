"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface StripeUserAttributes {
  id?: number;
  uuid: string;
  stripe_customer: string | null;
 
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    INTEGER: any;
    STRING: any;
    BOOLEAN: any;
  }
) => {
  class StripeUser extends Model<StripeUserAttributes> implements StripeUserAttributes {
    id!: number;
    uuid!: string;
    stripe_customer!: string | null;
    static associate(models: any) {
      // define associations here if any
    }
  }

  StripeUser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      stripe_customer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
     
    },
    {
      sequelize,
      modelName: "StripeUser",
      tableName: "stripe_user",
      timestamps: true,
    }
  );

  return StripeUser;
};
