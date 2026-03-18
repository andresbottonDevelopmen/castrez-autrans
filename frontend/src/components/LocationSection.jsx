import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';

const LocationSection = () => {
  return (
    <section id="ubicacion" className="py-16 md:py-32 px-4 md:px-12 bg-[#0A0A0A]" data-testid="location-section">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#D4AF37] text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            EncuÉntranos
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-['Syne'] tracking-tight">
            Nuestra Ubicación
          </h2>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto">
            Ven a visitarnos en el corazón de Terrassa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2988.8!2d2.0089!3d41.5636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4927a9e0e0001%3A0x0!2sCarrer%20Masnou%2025%2C%20Terrassa!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Castrez Autrans"
              />
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6 font-['Syne']">Castrez Autrans</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Dirección</p>
                  <p className="text-[#A3A3A3] text-sm">
                    Carrer Masnou 25<br />
                    08221 Terrassa, Barcelona
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Horario</p>
                  <p className="text-[#A3A3A3] text-sm">
                    Lunes - Viernes: 8:00 - 19:00<br />
                    Sábado: 9:00 - 14:00<br />
                    Domingo: Cerrado
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Teléfono</p>
                  <a href="tel:+34607665474" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                    +34 607 665 474
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Email</p>
                  <a href="mailto:info@castrezautrans.com" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                    info@castrezautrans.com
                  </a>
                </div>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Carrer+Masnou+25+Terrassa+Barcelona"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mt-8 btn-gold py-3 rounded-full text-center font-semibold"
              data-testid="directions-btn"
            >
              Cómo Llegar
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
