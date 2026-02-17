"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface ProfileAttributes {
  user_id?: number;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  postal_code: string | null;
  apartment_number: string | null;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    INTEGER: any;
    STRING: any;
  }
) => {
  class Profile extends Model<ProfileAttributes> implements ProfileAttributes {
    user_id!: number;
    first_name!: string | null;
    last_name!: string | null;
    address!: string | null;
    postal_code!: string | null;
    apartment_number!: string | null;

    static associate(models: any) {
      // For example: Profile.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  Profile.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      postal_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
       apartment_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Profile",
      tableName: "Profiles", // plural form by convention
      timestamps: true, // adds createdAt and updatedAt
    }
  );

  return Profile;
};
