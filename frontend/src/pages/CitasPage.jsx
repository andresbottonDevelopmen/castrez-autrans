import Navbar from '@/components/Navbar';
import AppointmentSection from '@/components/AppointmentSection';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { motion } from 'framer-motion';

const CitasPage = () => {
  return (
    <>
      <Navbar />

      {/* Spacer for fixed nav */}
      <div className="pt-20" />

      <AppointmentSection />
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default CitasPage;
