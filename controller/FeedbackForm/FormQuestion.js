import { QuestionGroup, FormQuestion } from "../../model/Pgmodel/Formquestion.js";
import sequelize from "../../config/PgDatabase.js";

// =========================================================================
// 1. GET ALL GROUPS & QUESTIONS (Pure Global Template - No Org Code needed)
// =========================================================================
export const getFormQuestions = async (req, res) => {
  try {
    const groups = await QuestionGroup.findAll({
      where: { isActive: true },
      order: [
        ["orderIndex", "ASC"],
        [{ model: FormQuestion, as: "questions" }, "questionNumber", "ASC"],
      ],
      include: [
        {
          model: FormQuestion,
          as: "questions",
          where: { isActive: true },
          required: false, // If a group has no questions yet, still return group
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching form questions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching questions.",
      error: error.message,
    });
  }
};

// =========================================================================
// 2. CREATE A NEW QUESTION GROUP (Admin only)
// =========================================================================
export const createQuestionGroup = async (req, res) => {
  try {
    const {
      groupKey,
      title,
      description,
      orderIndex,
      isRequired,
      showComments,
      commentsLabel,
      isCommentsRequired,
    } = req.body;

    if (!groupKey || !title) {
      return res.status(400).json({
        success: false,
        message: "groupKey (e.g. 'Group A') and title are required.",
      });
    }

    const newGroup = await QuestionGroup.create({
      groupKey: groupKey.trim(),
      title: title.trim(),
      description: description ? description.trim() : null,
      orderIndex: orderIndex !== undefined ? orderIndex : 1,
      isRequired: isRequired !== undefined ? Boolean(isRequired) : true,
      showComments: showComments !== undefined ? Boolean(showComments) : false,
      commentsLabel: commentsLabel ? commentsLabel.trim() : "Anything else you would like to tell us?",
      isCommentsRequired: isCommentsRequired !== undefined ? Boolean(isCommentsRequired) : false,
    });

    return res.status(201).json({
      success: true,
      message: "Question group created successfully.",
      data: newGroup,
    });
  } catch (error) {
    console.error("Error creating question group:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating question group.",
      error: error.message,
    });
  }
};

// =========================================================================
// 3. ADD QUESTION TO A GROUP (Admin only)
// =========================================================================
export const addQuestionToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
      questionNumber,
      questionText,
      questionType,
      options,
      isRequired,
      minRating,
      maxRating,
      orderIndex,
    } = req.body;

    const group = await QuestionGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: `Question group with ID ${groupId} not found.`,
      });
    }

    if (questionNumber === undefined || !questionText) {
      return res.status(400).json({
        success: false,
        message: "questionNumber and questionText are required.",
      });
    }

    const question = await FormQuestion.create({
      groupId: Number(groupId),
      questionNumber: Number(questionNumber),
      questionText: questionText.trim(),
      questionType: questionType || "rating",
      options: Array.isArray(options) ? options : [],
      isRequired: isRequired !== undefined ? Boolean(isRequired) : true,
      minRating: minRating !== undefined ? Number(minRating) : 1,
      maxRating: maxRating !== undefined ? Number(maxRating) : 5,
      orderIndex: orderIndex !== undefined ? Number(orderIndex) : Number(questionNumber),
    });

    return res.status(201).json({
      success: true,
      message: "Question added successfully.",
      data: question,
    });
  } catch (error) {
    console.error("Error adding question:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding question.",
      error: error.message,
    });
  }
};

// =========================================================================
// 4. BULK CREATE / SETUP COMPLETE FORM TEMPLATE (Atomic Transaction)
// =========================================================================
export const setupCompleteFormQuestions = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { groups } = req.body;

    if (!Array.isArray(groups) || groups.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "groups array is required.",
      });
    }

    const createdGroups = [];

    for (const grpData of groups) {
      const {
        groupKey,
        title,
        description,
        orderIndex,
        isRequired,
        showComments,
        commentsLabel,
        isCommentsRequired,
        questions,
      } = grpData;

      const group = await QuestionGroup.create(
        {
          groupKey: groupKey.trim(),
          title: title.trim(),
          description: description ? description.trim() : null,
          orderIndex: orderIndex || 1,
          isRequired: isRequired !== undefined ? isRequired : true,
          showComments: showComments !== undefined ? showComments : false,
          commentsLabel: commentsLabel || "Anything else you would like to tell us?",
          isCommentsRequired: isCommentsRequired !== undefined ? isCommentsRequired : false,
        },
        { transaction: t }
      );

      if (Array.isArray(questions) && questions.length > 0) {
        const questionPayloads = questions.map((q, idx) => ({
          groupId: group.id,
          questionNumber: q.questionNumber !== undefined ? q.questionNumber : idx + 1,
          questionText: q.questionText.trim(),
          questionType: q.questionType || "rating",
          options: Array.isArray(q.options) ? q.options : [],
          isRequired: q.isRequired !== undefined ? q.isRequired : true,
          minRating: q.minRating || 1,
          maxRating: q.maxRating || 5,
          orderIndex: q.orderIndex || idx + 1,
        }));

        await FormQuestion.bulkCreate(questionPayloads, { transaction: t });
      }

      createdGroups.push(group);
    }

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Complete form questions template setup successfully.",
      count: createdGroups.length,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error setting up questions in bulk:", error);
    return res.status(500).json({
      success: false,
      message: "Bulk setup failed. Transaction rolled back.",
      error: error.message,
    });
  }
};

// =========================================================================
// 5. UPDATE A GROUP CONFIG (Toggle isRequired, showComments, etc.)
// =========================================================================
export const updateQuestionGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await QuestionGroup.findByPk(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: `Group with ID ${id} not found.`,
      });
    }

    await group.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Question group updated successfully.",
      data: group,
    });
  } catch (error) {
    console.error("Error updating group:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating group.",
      error: error.message,
    });
  }
};

// =========================================================================
// 6. DELETE A QUESTION (Admin only)
// =========================================================================
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FormQuestion.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Question with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting question.",
      error: error.message,
    });
  }
};

export const deleteQuestionGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const group = await QuestionGroup.findByPk(id, { transaction: t });

        if (!group) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: `Group with ID ${id} not found.`,
            });
        }

        // Delete all questions associated with this group
        await FormQuestion.destroy({ where: { groupId: id }, transaction: t });

        // Delete the group itself
        await group.destroy({ transaction: t });

        await t.commit();

        return res.status(200).json({
            success: true,
            message: "Question group and its questions deleted successfully.",
        });
    } catch (error) {
        await t.rollback();
        console.error("Error deleting question group:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting question group.",
            error: error.message,
        });
    }
};