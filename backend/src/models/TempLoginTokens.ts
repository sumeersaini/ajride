"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

// ✅ The TypeScript interface for our new model's attributes
interface TempLoginTokensAttributes {
  token: string;
  sessionData: string;
  userId: string | null;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    STRING: any;
    TEXT: any;
    UUID: any;
  }
) => {
  class TempLoginTokens extends Model<TempLoginTokensAttributes> implements TempLoginTokensAttributes {
    token!: string;
    sessionData!: string;
    userId!: string | null;

    static associate(models: any) {
      // No associations needed for this temporary model
    }
  }

  TempLoginTokens.init(
    {
      // The cryptographically secure token, serving as the primary key.
      token: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      // The serialized JSON string of the user's Supabase session data.
      sessionData: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // The user's Supabase UUID, useful for debugging.
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "TempLoginTokens",
      tableName: "temp_login_tokens",
      timestamps: true, // This will automatically add `createdAt` and `updatedAt` columns.
    }
  );

  return TempLoginTokens;
};