import {sequelize} from "../../config/PgDatabase.js";
import {DataTypes} from "sequelize";

const FormStatusHistory = sequelize.define('FormStatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  adminName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adminEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'form_status_history',
  timestamps: true, // createdAt me timestamp aayega
});

export default FormStatusHistory;