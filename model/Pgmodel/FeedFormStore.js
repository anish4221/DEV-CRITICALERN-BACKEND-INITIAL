import { DataTypes } from "sequelize";
import sequelize from "../../config/PgDatabase.js";

const StudentFeedback = sequelize.define(
  "StudentFeedback",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organizationCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    formName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subFormName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // --- Section A: Participant Details ---
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    yearBranch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    enrolment: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // --- Dynamic Group-wise Responses ---
    // Stores nested answers and group comments:
    // {
    //   "Group A": { "answers": { "1": 5, "2": 4 }, "comment": "" },
    //   "Group B": { "answers": { "1": 5 }, "comment": "" },
    //   "Group C": { "answers": { "1": ["Resume", "Interview"] }, "comment": "Great session" }
    // }
    responses: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isSubmitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    tableName: "student_feedbacks",
    timestamps: true,
  }
);

export default StudentFeedback;