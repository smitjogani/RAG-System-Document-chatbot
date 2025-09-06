import { handleQuery } from '../services/query.service.js';

export const askQuestion = async (req, res) => {
    const { question, history } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
        return res.status(400).json({ message: 'A non-empty "question" string is required in the request body.' });
    }

    if (history && !Array.isArray(history)) {
        return res.status(400).json({ message: '"history" must be an array if provided.' });
    }

    try {
        const answer = await handleQuery(question, history || []);
        res.status(200).json({ answer });
    } catch (error) {
        console.error('Ask question controller failed:', error);
        res.status(500).json({
            message: 'An internal server error occurred while getting an answer.',
            error: error.message
        });
    }
};