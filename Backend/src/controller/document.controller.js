import { processAndIndexDocument } from '../services/document.service.js';

export const uploadDocuments = async (req, res) => { 
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }

    try {
        const processingPromises = req.files.map(file => processAndIndexDocument(file));
        await Promise.all(processingPromises);

        res.status(200).json({
            message: `${req.files.length} file(s) processed and indexed successfully.`
        });
    } catch (error) {
        console.error('Upload failed:', error);
        res.status(500).json({ message: 'Failed to process the document(s).', error: error.message });
    }
};
