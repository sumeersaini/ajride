"use strict";

import { Model, Sequelize } from "sequelize";

interface InvoiceAttributes {
  id?: number;
  uuid: string;
  rideId: number;
  merchantUuid: string;
  amount: number;
  currency: string;
  status: string;
  paymentIntent: string;
  paymentMethod: string | null;
  issuedAt: Date;
  cron: number;
  paidAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    INTEGER: any;
    STRING: any;
    DECIMAL: any;
    DATE: any;
  }
) => {
  class Invoice extends Model<InvoiceAttributes> implements InvoiceAttributes {
    id!: number;
    uuid!: string;
    rideId!: number;
    merchantUuid!: string;
    amount!: number;
    currency!: string;
    status!: string;
    paymentIntent!: string;
    paymentMethod!: string | null;
    issuedAt!: Date;
    cron!:number;
    paidAt?: Date | null;

    static associate(models: any) {
      // Example associations:
      // Invoice.belongsTo(models.Ride, { foreignKey: "rideId" });
      // Invoice.belongsTo(models.Merchant, { foreignKey: "merchantUuid", targetKey: "uuid" });
    }
  }

  Invoice.init(
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
      rideId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      merchantUuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2), // up to 99999999.99
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "USD",
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending", // pending, paid, failed, refunded
      },
      paymentIntent: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      issuedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        // defaultValue: DataTypes.NOW,
      },
      cron:{
          type: DataTypes.INTEGER,
        allowNull: true,
      },
      paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Invoice",
      tableName: "invoices",
      timestamps: true, // adds createdAt and updatedAt automatically
    }
  );

  return Invoice;
};
