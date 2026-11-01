import ExcelJS from "exceljs";
import StudentFeedback from "../../model/Pgmodel/FeedFormStore.js";

// GET /api/feedback/export?organizationCode=JMI  OR  POST /api/feedback/export { organizationCode: "JMI" }
export const exportFeedbackToExcel = async (req, res) => {
  try {
    // Read from query param or body
    const rawOrgCode = req.query.organizationCode || req.body.organizationCode;

    if (!rawOrgCode || !rawOrgCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Organization code is required to export data.",
      });
    }

    const organizationCode = rawOrgCode.trim().toUpperCase();

    // 1. Fetch all student feedback records for this organizationCode
    const feedbacks = await StudentFeedback.findAll({
      where: { organizationCode },
      order: [["createdAt", "ASC"]],
    });

    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No feedback data found for organization code: "${organizationCode}".`,
      });
    }

    // 2. Discover all unique groups, question keys, and comment columns across all responses
    const groupQuestionMap = {}; // { "Group A": Set("1", "2"), "Group B": Set("1") }
    const groupHasComments = {}; // { "Group A": true }

    feedbacks.forEach((record) => {
      const resp = record.responses || {};
      Object.keys(resp).forEach((groupName) => {
        if (!groupQuestionMap[groupName]) {
          groupQuestionMap[groupName] = new Set();
        }
        const answers = resp[groupName]?.answers || {};
        Object.keys(answers).forEach((qKey) => {
          groupQuestionMap[groupName].add(qKey);
        });

        if (resp[groupName]?.comment && resp[groupName].comment.trim() !== "") {
          groupHasComments[groupName] = true;
        }
      });
    });

    // 3. Initialize Excel Workbook & Worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CriticaLern";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(`${organizationCode} Feedback`);

    // 4. Define Column Headers
    const columns = [
      { header: "S.No", key: "sNo", width: 8 },
      { header: "Organization", key: "organization", width: 32 },
      { header: "Org Code", key: "organizationCode", width: 14 },
      { header: "Form Name", key: "formName", width: 24 },
      { header: "Sub Form Name", key: "subFormName", width: 32 },
      { header: "Full Name", key: "fullName", width: 24 },
      { header: "Mobile", key: "mobile", width: 16 },
      { header: "Email", key: "email", width: 28 },
      { header: "Year / Branch", key: "yearBranch", width: 28 },
      { header: "Enrolment No", key: "enrolment", width: 18 },
    ];

    // Dynamically append question columns grouped properly
    const sortedGroups = Object.keys(groupQuestionMap).sort();

    sortedGroups.forEach((grpName) => {
      const qKeys = Array.from(groupQuestionMap[grpName]).sort((a, b) => Number(a) - Number(b));
      qKeys.forEach((qNum) => {
        columns.push({
          header: `${grpName} - Q${qNum}`,
          key: `col_${grpName}_${qNum}`,
          width: 20,
        });
      });

      // Group comment column
      columns.push({
        header: `${grpName} - Comments`,
        key: `comment_${grpName}`,
        width: 32,
      });
    });

    // Submission Metadata
    columns.push(
      { header: "IP Address", key: "ipAddress", width: 16 },
      { header: "Submitted At", key: "createdAt", width: 22 }
    );

    worksheet.columns = columns;

    // 5. Style Header Row (Dark Blue background, White bold text)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1E3A8A" }, // Dark Indigo / Navy Blue
      };
      cell.font = {
        color: { argb: "FFFFFF" },
        bold: true,
        size: 11,
      };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });
    headerRow.height = 28;

    // 6. Populate Data Rows
    feedbacks.forEach((fb, index) => {
      const resp = fb.responses || {};
      const rowData = {
        sNo: index + 1,
        organization: fb.organization || "",
        organizationCode: fb.organizationCode || "",
        formName: fb.formName || "",
        subFormName: fb.subFormName || "",
        fullName: fb.fullName || "",
        mobile: fb.mobile || "",
        email: fb.email || "",
        yearBranch: fb.yearBranch || "",
        enrolment: fb.enrolment || "",
        ipAddress: fb.ipAddress || "",
        createdAt: fb.createdAt ? new Date(fb.createdAt).toLocaleString("en-IN") : "",
      };

      // Populate dynamic questions & comments
      sortedGroups.forEach((grpName) => {
        const qKeys = Array.from(groupQuestionMap[grpName]);
        const grpAnswers = resp[grpName]?.answers || {};

        qKeys.forEach((qNum) => {
          const val = grpAnswers[qNum];
          if (Array.isArray(val)) {
            rowData[`col_${grpName}_${qNum}`] = val.join(", ");
          } else if (val !== undefined && val !== null) {
            rowData[`col_${grpName}_${qNum}`] = val;
          } else {
            rowData[`col_${grpName}_${qNum}`] = "-";
          }
        });

        rowData[`comment_${grpName}`] = resp[grpName]?.comment || "-";
      });

      const addedRow = worksheet.addRow(rowData);
      addedRow.height = 20;
      addedRow.alignment = { vertical: "middle" };
    });

    // Apply borders to all table cells
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "E2E8F0" } },
          left: { style: "thin", color: { argb: "E2E8F0" } },
          bottom: { style: "thin", color: { argb: "E2E8F0" } },
          right: { style: "thin", color: { argb: "E2E8F0" } },
        };
      });
    });

    // 7. Send file stream as Excel download response
    const fileName = `${organizationCode}_Feedback_Export_${Date.now()}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    console.error("Error generating Excel export:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while generating Excel export.",
      error: error.message,
    });
  }
};

export default exportFeedbackToExcel;