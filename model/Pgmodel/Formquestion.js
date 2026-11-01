import { DataTypes } from "sequelize";
import sequelize from "../../config/PgDatabase.js";

// ==========================================
// 1. QUESTION GROUP MODEL (Group A, Group B...)
// ==========================================
export const QuestionGroup = sequelize.define(
  "QuestionGroup",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Optional identifier code, e.g. "GROUP_A", "GROUP_B"
    groupKey: {
      type: DataTypes.STRING,
      allowNull: false, // e.g. "Group A", "Group B"
    },
    // Display Title, e.g. "CONTENT & RELEVANCE", "RESOURCE PERSONS"
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Display order: 1 for Group A, 2 for Group B...
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    // Admin decision: Can student skip this whole group?
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // true = mandatory, false = optional (student can skip)
      allowNull: false,
    },
    // Admin decision: Show comments / suggestions box at end of this group?
    showComments: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // true = comments box will be shown
      allowNull: false,
    },
    commentsLabel: {
      type: DataTypes.STRING,
      defaultValue: "Anything else you would like to tell us?",
      allowNull: true,
    },
    isCommentsRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Usually optional
      allowNull: false,
    },
    // Active status
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    tableName: "question_groups",
    timestamps: true,
  }
);

// ==========================================
// 2. FORM QUESTION MODEL (1, 2, 3, 4, 5...)
// ==========================================
export const FormQuestion = sequelize.define(
  "FormQuestion",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Foreign key to QuestionGroup
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "question_groups",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    // Question numbering within group: 1, 2, 3, 4, 5...
    questionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // The question text
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Question type: 'rating' (1-5), 'single_choice', 'multi_choice', 'text'
    questionType: {
      type: DataTypes.ENUM("rating", "single_choice", "multi_choice", "text"),
      defaultValue: "rating",
      allowNull: false,
    },
    // For single_choice or multi_choice: ["Resume", "Interview", "LinkedIn"]
    options: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      allowNull: true,
    },
    // Admin decision: Is this specific question required or optional?
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // true = student must answer, false = optional (can skip)
      allowNull: false,
    },
    // Rating scale limits (default 1 to 5)
    minRating: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: true,
    },
    maxRating: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: true,
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    tableName: "form_questions",
    timestamps: true,
  }
);

// ==========================================
// 3. ASSOCIATIONS (Relational Mapping)
// ==========================================
QuestionGroup.hasMany(FormQuestion, {
  foreignKey: "groupId",
  as: "questions",
});

FormQuestion.belongsTo(QuestionGroup, {
  foreignKey: "groupId",
  as: "group",
});




export default { QuestionGroup, FormQuestion };

