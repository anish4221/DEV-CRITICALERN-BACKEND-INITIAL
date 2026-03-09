import { Contact } from "../../model/Contactus/Contact.js";

export const SaveContactUs = async (req, res) => {
  try{
    const {FullName, EmailAddress, PhoneNo, Message} = req.body;

    if(!FullName || !EmailAddress || !PhoneNo || !Message){
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    const user = await Contact.findOne({
  $or: [
    { EmailAddress },
    { PhoneNo }
  ]
});

    if (user) {
  return res.status(400).json({
    success: false,
    message: 'Email or Phone number already exists'
  });
}
    const contact = new Contact({
        FullName,
        EmailAddress,
        PhoneNo,
        Message
    }); 
    const savedContact = await contact.save();
    if (savedContact) {
        console.log("its now saved")
        res.status(201).json({
            success: true,
            message: 'Contact information saved successfully',
            data: savedContact
        });

  }
    } catch (error) {
        console.error('Error saving contact information:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while saving contact information'
        });
    }   
};

export const getContactUs = async (req, res) => {
    try{
        const {page, limit} = req.body;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;
        
        const totalContacts = await Contact.countDocuments();
        if (totalContacts === 0) {
            return res.status(404).json({
                success: false,
                message: 'No contact information found'
            });
        }
        const contacts = await contact.find().skip(skip).limit(limit).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: contacts,
            total: totalContacts,
            page,
            pages: Math.ceil(totalContacts / limit)
        });
    }
    catch (error) {
        console.error('Error retrieving contact information:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while retrieving contact information'
        });
    }
}