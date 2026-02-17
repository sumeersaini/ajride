"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface PaymentAttributes {
  id?: number;
  ride_id: number;
  user_id: string;
  driver_id?: string | null;
  amount: number;
  currency: string;
  method: "cash" | "card" | "upi" | "wallet";
  status: "pending" | "paid" | "failed" | "refunded";
  transaction_id?: string | null;
  paid_at?: Date | null;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    INTEGER: any;
    STRING: any;
    ENUM: any;
    FLOAT: any;
    DATE: any;
  }
) => {
  class Payments extends Model<PaymentAttributes> implements PaymentAttributes {
    id!: number;
    ride_id!: number;
    user_id!: string;
    driver_id!: string | null;
    amount!: number;
    currency!: string;
    method!: "cash" | "card" | "upi" | "wallet";
    status!: "pending" | "paid" | "failed" | "refunded";
    transaction_id!: string | null;
    paid_at!: Date | null;

    static associate(models: any) {
      Payments.belongsTo(models.Rides, { foreignKey: "ride_id" });
      // You could also link to Users and Drivers if needed
    }
  }

  Payments.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      ride_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      driver_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "INR", // or USD/EUR depending on your app
      },
      method: {
        type: DataTypes.ENUM("cash", "card", "upi", "wallet"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Payments",
      tableName: "payments",
      timestamps: true,
      underscored: true,
    }
  );

  return Payments;
};
