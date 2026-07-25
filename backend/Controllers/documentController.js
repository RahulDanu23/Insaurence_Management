const Document = require('../config/Document');
const Customer = require('../config/customerSchema');
const fs = require('fs');
const path = require('path');

// Upload a document
let uploadDocument = async (req, res) => {
  try {
    const { document_type } = req.body;

    // Validate document_type
    if (!document_type) {
      return res.status(400).json({ message: "Please provide document_type" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // Find the customer linked to the logged-in user
    const customer = await Customer.findOne({ user_id: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const newDocument = await Document.create({
      customer_id: customer._id,
      document_type: document_type,
      file_name: req.file.originalname,
      file_path: req.file.path.replace(/\\/g, '/')
    });

    return res.status(201).json({
      message: "Document uploaded successfully",
      document: newDocument
    });
  } catch (error) {
    return res.status(400).json({ message: "Internal server error", error: error.message });
  }
};

// Get my documents (for the logged-in customer)
let getMyDocuments = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user_id: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const documents = await Document.find({ customer_id: customer._id });
    return res.status(200).json({
      message: "Documents fetched successfully",
      documents: documents
    });
  } catch (error) {
    return res.status(400).json({ message: "Internal server error", error: error.message });
  }
};

// Get all documents (Admin/Agent only)
let getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().populate('customer_id');
    return res.status(200).json({
      message: "All documents fetched successfully",
      documents: documents
    });
  } catch (error) {
    return res.status(400).json({ message: "Internal server error", error: error.message });
  }
};

// Delete a document
let deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete the file from the filesystem
    const fullPath = path.join(__dirname, '..', document.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Delete the document record from the database
    await Document.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  deleteDocument
};
