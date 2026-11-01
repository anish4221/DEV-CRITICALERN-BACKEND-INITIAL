import FormStatus from "../../model/Pgmodel/FeedBackStatus.js";
import StudentFeedback from "../../model/Pgmodel/FeedFormStore.js";
import { Op } from "sequelize";
import { feedbackQueue } from "../../utils/feedbackQueue.js";

// POST /api/feedback/submit
const submitFeedback = async (req, res) => {
  try {
    // 1. Verify if form is currently open
    const currentFormStatus = await FormStatus.findByPk(1);
    if (!currentFormStatus || currentFormStatus.status === false) {
      return res.status(403).json({
        success: false,
        message: "Feedback form is currently closed.",
      });
    }

    const {
      fullName,
      mobile,
      yearBranch,
      email,
      enrolment,
      responses,
    } = req.body;

    const ipAddress =
      req.ip ||
      req.connection?.remoteAddress ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress;

    // 2. Validate participant details and responses payload
    if (!fullName || !mobile || !email || !enrolment || !responses) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required participant details and form responses.",
      });
    }

    if (typeof responses !== "object" || Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        message: "Invalid format for responses. Must be an object grouped by Group keys.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    // 3. Duplicate check: User cannot submit again ONLY IF isSubmitted === true
    const existingSubmission = await StudentFeedback.findOne({
      where: {
        organization: currentFormStatus.organization,
        isSubmitted: true, // Only block if submission is currently active/locked
        [Op.or]: [
          { email: cleanEmail },
          { mobile: cleanMobile },
        ],
      },
    });

    if (existingSubmission) {
      const duplicateField =
        existingSubmission.email === cleanEmail ? "Email address" : "Mobile number";
      return res.status(409).json({
        success: false,
        message: `${duplicateField} has already submitted feedback for this session.`,
      });
    }

    // 4. Prepare payload for the background worker (Auto-attach active session metadata)
    const feedbackPayload = {
      organization: currentFormStatus.organization,
      organizationCode: currentFormStatus.organizationCode,
      formName: currentFormStatus.formName,
      subFormName: currentFormStatus.subFormName,
      fullName: fullName.trim().toUpperCase(),
      mobile: cleanMobile,
      yearBranch: yearBranch ? yearBranch.trim() : "",
      email: cleanEmail,
      enrolment: enrolment.trim(),
      responses, // Dynamic group-wise mapped responses
      ipAddress,
      isSubmitted: true, // Default true on fresh submission
    };

    // 5. Push job into BullMQ queue (Fast non-blocking)
    const job = await feedbackQueue.add("submit-feedback", feedbackPayload);

    // 6. Return instant response (< 10ms)
    return res.status(200).json({
      success: true,
      message: "Feedback submitted successfully!",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Error processing feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving feedback.",
      error: error.message,
    });
  }
};

export default submitFeedback;