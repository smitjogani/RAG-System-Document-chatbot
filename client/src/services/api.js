const API_BASE_URL = 'http://localhost:3000/api';

export const uploadFiles = async (files) => {
    const formData = new FormData();
    for (const file of files) {
        formData.append('documents', file);
    }

    const response = await fetch(`${API_BASE_URL}/document/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'File upload failed');
    }

    return response.json();
};

export const askQuestion = async (question, history) => {
    const response = await fetch(`${API_BASE_URL}/query/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question,
            history,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get an answer');
    }

    return response.json();
};
