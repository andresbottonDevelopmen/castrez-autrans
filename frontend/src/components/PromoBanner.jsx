import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PromoBanner = () => {
  const [banner, setBanner] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(`${API}/banners/active`);
        if (response.data) {
          setBanner(response.data);
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
      }
    };

    fetchBanner();
  }, []);

  if (!banner || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-20 left-0 right-0 z-40 px-4"
        data-testid="promo-banner"
      >
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Tag size={20} className="text-[#D4AF37]" />
            <div>
              <p className="text-white font-semibold">{banner.title}</p>
              <p className="text-[#A3A3A3] text-sm">
                {banner.description} - <span className="text-[#D4AF37] font-bold">{banner.discount_text}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-[#A3A3A3] hover:text-white p-1"
            data-testid="close-banner-btn"
          >
            <X size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromoBanner;
