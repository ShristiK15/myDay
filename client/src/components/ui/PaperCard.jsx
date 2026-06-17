import { motion } from 'framer-motion';

export default function PaperCard({ children, className = '', tape = false, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`app-card rounded-2xl p-6 paper-shadow ${className}`}
      {...props}
    >
      {tape && <div className="tape" aria-hidden />}
      {children}
    </motion.div>
  );
}
