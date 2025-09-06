import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, X } from 'lucide-react';
import { uploadFiles } from '../services/api';
import Loader from './Loader';

const UploadPanel = ({ onUploadSuccess }) => {
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [isDragging, setIsDragging] = useState(false);

    const allowedMime = ['application/pdf', 'application/json'];
    const allowedExt = ['.pdf', '.json'];

    const isAllowedFile = (file) => {
        if (!file || !file.name) return false;
        const mimeOk = allowedMime.includes(file.type);
        const name = file.name.toLowerCase();
        const extOk = allowedExt.some(ext => name.endsWith(ext));
        return mimeOk || extOk;
    };

    const addFiles = (incomingFiles) => {
        const selectedFiles = Array.from(incomingFiles);
        const valid = [];
        const rejected = [];

        selectedFiles.forEach(f => {
            if (isAllowedFile(f)) valid.push(f);
            else rejected.push(f.name);
        });

        setFiles(prev => {
            // dedupe by name+size
            const existingKeys = new Set(prev.map(p => `${p.name}_${p.size}`));
            const toAdd = valid.filter(v => !existingKeys.has(`${v.name}_${v.size}`));
            return [...prev, ...toAdd];
        });

        if (rejected.length > 0) {
            setStatus({ message: `Rejected (only .pdf and .json allowed): ${rejected.join(', ')}`, type: 'error' });
            // clear the message after a short delay
            setTimeout(() => setStatus({ message: '', type: '' }), 6000);
        } else {
            setStatus({ message: '', type: '' });
        }
    };

    const handleFileChange = (e) => {
        addFiles(e.target.files);
        // reset input so same file can be selected again if removed
        e.target.value = null;
    };

    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setStatus({ message: 'Please select at least one file.', type: 'error' });
            return;
        }
        setIsUploading(true);
        setStatus({ message: 'Uploading and processing...', type: 'loading' });

        try {
            const result = await uploadFiles(files);
            setStatus({ message: result.message, type: 'success' });
            onUploadSuccess();
            setFiles([]);
        } catch (error) {
            setStatus({ message: error.message || 'Upload failed', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    return (
        <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 p-6 flex flex-col shadow-lg"
        >
            <div className="flex items-center mb-6">
                <svg className="w-8 h-8 text-blue-600 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <h1 className="text-2xl font-bold text-gray-900">DocuMind</h1>
            </div>

            <div
                onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
            >
                <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                <p className="font-semibold text-gray-700">Add documents to knowledge base</p>
                <p className="text-sm text-gray-500 mt-1">or</p>
                <label htmlFor="file-upload" className="mt-4 cursor-pointer text-blue-600 font-medium hover:underline">
                    Browse files
                </label>
                <input id="file-upload" type="file" accept=".pdf,application/pdf,.json,application/json" multiple className="hidden" onChange={handleFileChange} />
            </div>

            <div className="mt-6 flex-1 overflow-y-auto">
                <h2 className="font-semibold text-gray-700 mb-2">Staged Files ({files.length})</h2>
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                            <div className="flex items-center truncate"><FileText className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" /><span className="text-sm text-gray-800 truncate">{file.name}</span></div>
                            <button onClick={() => removeFile(file.name)} className="p-1 rounded-full hover:bg-gray-200"><X className="w-4 h-4 text-gray-600" /></button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-4">
                <button
                    onClick={handleUpload}
                    disabled={isUploading || files.length === 0}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isUploading ? <Loader /> : 'Add to Knowledge Base'}
                </button>
                {status.message && (
                    <p className={`mt-3 text-sm text-center font-medium ${status.type === 'success' ? 'text-green-600' : status.type === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                        {status.message}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default UploadPanel;
