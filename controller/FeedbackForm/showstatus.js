import FormStatus from "../../model/Pgmodel/FeedBackStatus.js";
import FormStatusHistory from "../../model/Pgmodel/FeedBackFormHistory.js";
import sequelize from "../../config/PgDatabase.js";

const updateFormStatus = async (req, res) => {
  try {
    const userInfo = req.user;
    const { status, organization, organizationCode, formName, subFormName } = req.body;
    const ipAddress =
      req.ip ||
      req.connection?.remoteAddress ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress;

    console.log("IP Address:", ipAddress);
    console.log("User Info:", userInfo);
    console.log("Form Status:", status);
    console.log("Organization:", organization);
    console.log("Organization Code:", organizationCode);
    console.log("Form Name:", formName);
    console.log("Sub Form Name:", subFormName);

    if (status === undefined || typeof status !== "boolean") {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Agar form open (status: true) kiya ja raha hai, toh organization dena mandatory hai
    if (status === true && (!organization || !organization.trim())) {
      return res
        .status(400)
        .json({ error: "Organization name is required when opening the form." });
    }

    if (!userInfo) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Start a transaction — if either DB write fails, both are rolled back (atomicity)
    const t = await sequelize.transaction();

    try {
      const activeOrg = status ? organization.trim() : null;
      const activeOrgCode = status && organizationCode ? organizationCode.trim().toUpperCase() : null;
      const activeFormName = status && formName ? formName.trim() : null;
      const activeSubFormName = status && subFormName ? subFormName.trim() : null;

      // Write 1: Insert history record
      await FormStatusHistory.create(
        {
          status,
          organization: activeOrg,
          organizationCode: activeOrgCode,
          formName: activeFormName,
          subFormName: activeSubFormName,
          adminName: userInfo.name,
          adminEmail: userInfo.email,
          ipAddress,
        },
        { transaction: t }
      );

      // Write 2: Update or Insert the current form status (id: 1)
      await FormStatus.upsert(
        {
          id: 1,
          status,
          organization: activeOrg,
          organizationCode: activeOrgCode,
          formName: activeFormName,
          subFormName: activeSubFormName,
          lastUpdatedByName: userInfo.name,
          lastUpdatedByEmail: userInfo.email,
          lastUpdatedByIp: ipAddress,
        },
        {
          transaction: t,
        }
      );

      // Both writes succeeded — commit the transaction
      await t.commit();

      return res
        .status(200)
        .json({ message: "Form status updated successfully" });

    } catch (transactionError) {
      // One of the writes failed — roll back everything
      await t.rollback();
      console.error("Transaction rolled back due to error:", transactionError);
      return res
        .status(500)
        .json({ error: "Transaction failed. No changes were saved." });
    }

  } catch (error) {
    console.error("Error updating form status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFormStatus = async (req, res) => {
  try {
    const formStatus = await FormStatus.findByPk(1);
    if (!formStatus) {
      return res.status(404).json({ error: "Form status not found" });
    }
    return res.status(200).json({
      status: formStatus.status,
      organization: formStatus.organization,
      organizationCode: formStatus.organizationCode,
      formName: formStatus.formName,
      subFormName: formStatus.subFormName,
    });
  } catch (error) {
    console.error("Error retrieving form status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { getFormStatus, updateFormStatus };
