"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

interface HostDetailsAttributes {
  uuid?: string;
  contact_email: string | null;
  contact_phone: string | null;
  birthdate: string | null;
  city: string | null;
}

module.exports = (
  sequelize: Sequelize,
  DataTypes: {
    UUID: any;
    STRING: any;
    DATEONLY: any;
  }
) => {
  class HostDetails extends Model<HostDetailsAttributes> implements HostDetailsAttributes {
    uuid!: string;
    contact_email!: string | null;
    contact_phone!: string | null;
    birthdate!: string | null;
    city!: string | null;

    static associate(models: any) {
      // Example: HostDetails.belongsTo(models.User, { foreignKey: 'uuid' });
    }
  }

  HostDetails.init(
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      birthdate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "HostDetails",
      tableName: "host_details",
      timestamps: true,
    }
  );

  return HostDetails;
};
