import sequelize from "../../../config/PgDatabase.js";
import {DataTypes} from "sequelize";

const Opportunity = sequelize.define(
  "Opportunity",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    link: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_active",
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "updated_at",
    },
  },
  {
    tableName: "opportunities",
  }
);

export default Opportunity;