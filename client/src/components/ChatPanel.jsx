import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, BrainCircuit } from 'lucide-react';
import { askQuestion } from '../services/api';
import Message from './Message';

const ChatPanel = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        setMessages([{
            sender: 'ai',
            text: 'Hello! I am ready to answer questions based on the knowledge base. You can add more documents at any time using the panel on the left.'
        }]);
    }, []);

    useEffect(() => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const result = await askQuestion(input, history);
            const aiMessage = { sender: 'ai', text: result.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = { sender: 'ai', text: `Error: ${error.message}`, isError: true };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full md:w-2/3 lg:w-3/4 flex flex-col bg-gray-100 h-full"
        >
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Chat Interface</h2>
                    <p className="text-sm text-gray-500 mt-1">Interacting with the persistent knowledge base.</p>
                </div>
                <BrainCircuit className="w-8 h-8 text-blue-500" />
            </div>

            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <Message key={index} message={msg} />
                    ))}
                </AnimatePresence>
                {isLoading && <Message message={{ sender: 'ai', text: '...', isLoading: true }} />}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about the knowledge base..."
                        className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="1"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="absolute right-2 mt-[2px] top-6 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ChatPanel;
