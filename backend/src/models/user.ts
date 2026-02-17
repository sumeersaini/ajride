"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface UserAttributes {
  id?: number;
  uuid: string;
  email: string | null;
  email_verified: boolean | null;
  active: boolean;
  username: string | null;
  type: string;
  client: string;
  phone: string | null;
  merchant: number;
  is_admin: number;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    INTEGER: any;
    STRING: any;
    BOOLEAN: any;
  }
) => {
  class User extends Model<UserAttributes> implements UserAttributes {
    id!: number;
    uuid!: string;
    email!: string | null;
    email_verified!: boolean | null;
    active!: boolean;
    username!: string | null;
    type!: string;
    client!: string;
    phone!: string | null;
    merchant!: number;
    is_admin!:number;

    static associate(models: any) {
      // define associations here if any
    }
  }

  User.init(
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
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      client: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      merchant: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_admin:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
    }
  );

  return User;
};
