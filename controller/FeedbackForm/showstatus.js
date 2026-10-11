import FormStatus from "../../model/Pgmodel/FeedBackStatus.js";
import FormStatusHistory from "../../model/Pgmodel/FeedBackFormHistory.js";
import sequelize from "../../config/PgDatabase.js";

const updateFormStatus = async (req, res) => {
  try {
    const userInfo = req.authenticate;
    const { status } = req.body;
    const ipAddress =
      req.ip ||
      req.connection?.remoteAddress ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress;

    console.log("User Info:", userInfo);
    console.log("Form Status:", status);

    if (status === undefined || typeof status !== "boolean") {
      return res.status(400).json({ error: "Invalid status value" });
    }
    if (!userInfo || !userInfo.isAdmin) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Start a transaction — if either DB write fails, both are rolled back (atomicity)
    const t = await sequelize.transaction();

    try {
      // Write 1: Insert history record
      await FormStatusHistory.create(
        {
          status,
          adminName: userInfo.name,
          adminEmail: userInfo.email,
          ipAddress,
        },
        { transaction: t }
      );

      // Write 2: Update the current form status
      await FormStatus.update(
        {
          status,
          adminName: userInfo.name,
          adminEmail: userInfo.email,
          ipAddress,
        },
        {
          where: { id: 1 },
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

export default updateFormStatus;