"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface PricingSettingsAttributes {
  uuid?: string;
  start_price: number;
  price_per_km: number;
  initial_wait_time: number;
  wait_time_cost: number;
  cancel_fees: number;
  platform_fee: number;
  admin_commission: number;

  // New vehicle-specific prices
  sedan_price_per_km?: number;
  suv_price_per_km?: number;
  muv_price_per_km?: number;
  coupe_price_per_km?: number;
  convertible_price_per_km?: number;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    INTEGER: any;
    STRING: any;
    FLOAT: any;
  }
) => {
  class PricingSettings
    extends Model<PricingSettingsAttributes>
    implements PricingSettingsAttributes
  {
    uuid!: string;
    start_price!: number;
    price_per_km!: number;
    initial_wait_time!: number;
    wait_time_cost!: number;
    cancel_fees!: number;
    platform_fee!: number;
    admin_commission!: number;

    // New vehicle-specific pricing
    sedan_price_per_km!: number;
    suv_price_per_km!: number;
    muv_price_per_km!: number;
    coupe_price_per_km!: number;
    convertible_price_per_km!: number;

    static associate(models: any) {
      // define associations here
    }
  }

  PricingSettings.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      start_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      price_per_km: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      initial_wait_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      wait_time_cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      cancel_fees: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      
      platform_fee: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      admin_commission: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      
      sedan_price_per_km: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      suv_price_per_km: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      muv_price_per_km: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      coupe_price_per_km: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      convertible_price_per_km: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "PricingSettings",
      tableName: "pricing_settings",
      timestamps: true,
    }
  );

  return PricingSettings;
};
