import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
    const variants = {
        initial: { y: 0 },
        animate: {
            y: ["-20%", "20%"],
            transition: {
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="flex justify-center items-center space-x-1.5">
            <motion.div variants={variants} initial="initial" animate="animate" className="w-2 h-2 bg-blue-500 rounded-full" />
            <motion.div variants={variants} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="w-2 h-2 bg-blue-500 rounded-full" />
            <motion.div variants={variants} initial="initial" animate="animate" transition={{ delay: 0.2 }} className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
    );
};

export default Loader;
