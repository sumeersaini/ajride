"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface RatingAttributes {
  id?: number;
  ride_id: number;
  rater_id: string;
  ratee_id: string;
  rating: number;
  comment?: string | null;
  created_at?: Date;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    INTEGER: any;
    STRING: any;
    ENUM: any;
    FLOAT: any;
    TEXT: any;
    DATE: any;   // ✅ add this
    NOW: any;    // ✅ add this
  }
) => {
  class Ratings extends Model<RatingAttributes> implements RatingAttributes {
    id!: number;
    ride_id!: number;
    rater_id!: string;
    ratee_id!: string;
    rating!: number;
    comment!: string | null;
    created_at!: Date;
  }

  Ratings.init(
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
      rater_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ratee_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Ratings",
      tableName: "ratings",
      timestamps: false, // we already manage created_at
      underscored: true,
    }
  );

  return Ratings;
};
