import { motion } from 'framer-motion';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_1c5df42d-6505-4d6c-97c6-dd11a75d6657/artifacts/f0cxn3lf_logo%20castrez.avif';

const Preloader = () => {
  return (
    <motion.div
      className="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="preloader"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.img
          src={LOGO_URL}
          alt="Castrez Autrans"
          className="preloader-logo h-24 md:h-32"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-6 max-w-[200px] mx-auto"
        />
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
