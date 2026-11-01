import InternshipLink from "../../model/Internships/internshipslinks.js";
import NodeCache from "node-cache";
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes
const addInternshipLink = async (req, res) => {
    try {
        const author = req.user._id;
        if (!author) {
            return res.status(401).json({
                message: "User not authenticated or user ID missing",
            });
        } // Assuming you have user authentication and the user ID is available in req.user._id
        const { link, title, status } = req.body;
        const internshipLink = new InternshipLink({ author, link, title, status });
        await internshipLink.save();
        res.status(201).json(internshipLink);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getInternshipLinks = async (req, res) => {
    try {

        const author = req.user._id; // Assuming you have user authentication and the user ID is available in req.user._id  
        const cacheKey = `internshipLinks_${author}`;
        const cachedLinks = cache.get(cacheKey);
        if (cachedLinks) {
            return res.status(200).json(cachedLinks);
        }
        const internshipLinks = await InternshipLink.find({ author }).sort({ createdAt: -1 });
        res.status(200).json(internshipLinks);
        cache.set(cacheKey, internshipLinks);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { addInternshipLink, getInternshipLinks };