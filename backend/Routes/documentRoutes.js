const express = require('express');
const Router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadDocument, getMyDocuments, getAllDocuments, deleteDocument } = require('../Controllers/documentController');

// Customer can upload their own documents
Router.post('/upload', authMiddleware, upload.single('file'), uploadDocument);

// Customer can view their own documents
Router.get('/my-documents', authMiddleware, getMyDocuments);

// Admin/Agent can view all documents
Router.get('/all', authMiddleware, roleMiddleware(['Admin', 'Agent']), getAllDocuments);

// Admin/Agent can delete a document
Router.delete('/delete/:id', authMiddleware, roleMiddleware(['Admin', 'Agent']), deleteDocument);

module.exports = Router;
