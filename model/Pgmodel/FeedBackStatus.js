import {DataTypes} from "sequelize";
import { sequelize } from "../../config/PgDatabase.js";
// Table 1: Current Status (Sirf 1 row jo overwrite hogi)
const FormStatus = sequelize.define('FormStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1, // Hamesha ID = 1 rahegi
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  lastUpdatedByName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastUpdatedByEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastUpdatedByIp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'form_status',
  timestamps: true, // updatedAt me last update ka exact time aayega
});

export default FormStatus;