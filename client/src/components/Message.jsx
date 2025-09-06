import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import Loader from './Loader';

const Message = ({ message }) => {
    const { sender, text, isError, isLoading } = message;

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    if (isLoading) {
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex items-start gap-3"
            >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white text-gray-800 p-3 rounded-lg shadow-sm max-w-xs md:max-w-md lg:max-w-2xl">
                    <Loader />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`flex items-start gap-3 ${sender === 'user' ? 'justify-end' : ''}`}
        >
            {sender === 'ai' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isError ? 'bg-red-500' : 'bg-blue-500'}`}>
                    <Bot className="w-5 h-5 text-white" />
                </div>
            )}

            <div
                className={`p-3 rounded-lg shadow-sm max-w-xs md:max-w-md lg:max-w-2xl ${sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : isError
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-white text-gray-800'
                    }`}
            >
                <p className="text-sm whitespace-pre-wrap">{text}</p>
            </div>

            {sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                </div>
            )}
        </motion.div>
    );
};

export default Message;
