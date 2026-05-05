import { Contact } from "../../model/Contactus/Contact.js";
import { emailQueue } from "../../utils/mailqueue.js";

export const SaveContactUs = async (req, res) => {
  try {
    console.log(req.body);
    const { FullName, EmailAddress, PhoneNo, Message } = req.body;

    if (!FullName || !EmailAddress || !PhoneNo || !Message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await Contact.findOne({
      $or: [{ EmailAddress }, { PhoneNo }],
    });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "Email or Phone number already exists",
      });
    }

    const emailHtml = `
       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">

      <!-- LOGO -->
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dpmcslv0u/image/upload/v1775412499/logo_acnsob.png" alt="Criticalern" width="180" />
      </div>

      <!-- CONTENT -->
      <h2 style="color: #2c3e50;">Thank You, ${FullName}!</h2>

      <p>We’ve received your query and appreciate you reaching out to us.</p>

      <p>
        Our team is currently reviewing your message and will get back to you within the next 
        <strong>4–5 working hours</strong>.
      </p>

      <p>
        If you have any additional information to share in the meantime, feel free to reply to this email.
      </p>

      <p>Thanks again for your patience and interest.</p>

      <!-- SIGNATURE -->
      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
        <p style="margin: 0;"><strong>Criticalern Support Team</strong></p>
        <p style="margin: 0; font-size: 13px; color: #777;">
          Explore • Experience • Excel
        </p>

        <!-- SOCIAL ICONS -->
        <div style="margin-top: 10px;">
          <a href="https://linkedin.com" target="_blank" style="margin-right: 10px;">
            <img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" />
          </a>

          <a href="https://twitter.com" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" />
          </a>
        </div>
      </div>

    </div>
    `;

    const contact = new Contact({
      FullName,
      EmailAddress,
      PhoneNo,
      Message,
    });
    const savedContact = await contact.save();
    if (savedContact) {
      console.log("its now saved");
      await emailQueue.add("sendContactEmail", {
        to: EmailAddress,
        subject: `Thank you for reaching out, ${FullName} — we'll respond shortly`,
        html: emailHtml,
      });

      setTimeout(() => {
      res.status(201).json({
        success: true,
        message: "Contact information saved successfully",
        data: savedContact,
      });
    }, 4000);
    }
  } catch (error) {
    console.error("Error saving contact information:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while saving contact information",
    });
  }
};

export const getContactUs = async (req, res) => {
  try {
    const { page, limit } = req.body;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    const totalContacts = await Contact.countDocuments();
    if (totalContacts === 0) {
      return res.status(404).json({
        success: false,
        message: "No contact information found",
      });
    }
    const contacts = await contact
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: contacts,
      total: totalContacts,
      page,
      pages: Math.ceil(totalContacts / limit),
    });
  } catch (error) {
    console.error("Error retrieving contact information:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving contact information",
    });
  }
};
