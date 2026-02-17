"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface CarAttributes {
  user_id: string;
  car_type: string;
  car_engine:string;
  car_name: string;
  images: string; // Comma-separated list of image URLs or file names
  descriptions: string;
  price_per_mile: number;
  owner_name: string;
  location: string;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    STRING: any;
    TEXT: any;
    FLOAT: any;
  }
) => {
  class Car extends Model<CarAttributes> implements CarAttributes {
    user_id!: string;
    car_type!: string;
    car_engine!:string;
    car_name!: string;
    images!: string;
    descriptions!: string;
    price_per_mile!: number;
    owner_name!: string;
    location!: string;

    static associate(models: any) {
      // Example: Car.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }

  Car.init(
    {
      user_id: { type: DataTypes.STRING, allowNull: false },
      car_type: { type: DataTypes.STRING, allowNull: false },
      car_engine:{ type: DataTypes.STRING, allowNull: false },
      car_name: { type: DataTypes.STRING, allowNull: false },
      images: { type: DataTypes.TEXT, allowNull: false }, // TEXT in case of long image lists
      descriptions: { type: DataTypes.TEXT, allowNull: true },
      price_per_mile: { type: DataTypes.FLOAT, allowNull: false },
      owner_name: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.STRING}
    },
    {
      sequelize,
      modelName: "Car",
      tableName: "Cars",
      timestamps: true,
    }
  );

  return Car;
};
