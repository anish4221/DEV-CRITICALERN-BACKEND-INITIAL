import sequelize from "../../config/PgDatabase.js";
import Opportunity from "../../model/Pgmodel/Opportunities/AddLinks.js";

const addOpportunityLink = async (req, res) => {
  try {
    const { title, link, isActive } = req.body;
    const author = req.user?._id;

    if (!author) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    if(!title || !link) {
      return res.status(400).json({ message: "Title and Link are required" });
    }

    const newOpportunity = await Opportunity.create({
      title,
      link,
      isActive
    });
    res.status(201).json(newOpportunity);
  } catch (error) {
    console.error("Error adding opportunity link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const getOpportunities = async (req, res) => {
  try {
    // 1. Fetch active opportunities
    const opportunities = await Opportunity.findAll({
      where: {
        isActive: true,
      },
      raw: true,
    });

    // 2. Calculate current time and 5-day duration
    const now = Date.now();

    const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;

    // 3. Calculate NEW badge status
    const updatedOpportunities = opportunities.map(item => {

      const createdTime = new Date(item.createdAt).getTime();

      const newBadgeUntil = createdTime + FIVE_DAYS;

      return {
        ...item,
        isNew: now < newBadgeUntil,
        newBadgeUntil,
      };
    });

    // 4. Sort opportunities
    updatedOpportunities.sort((a, b) => {

      // NEW opportunities first
      if (a.isNew !== b.isNew) {
        return a.isNew ? -1 : 1;
      }

      // Earliest NEW badge expiry first
      if (a.isNew) {
        return a.newBadgeUntil - b.newBadgeUntil;
      }

      // Normal opportunities: newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // 5. Send response
    return res.status(200).json({
      success: true,
      data: updatedOpportunities,
    });

  } catch (error) {
    console.error("Error fetching opportunities:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
 export { addOpportunityLink, getOpportunities };
