import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { motion } from 'framer-motion';
import { Target, Eye, Compass, Users, Award, Clock, Shield, Heart } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Confianza',
    text: 'Transparencia total en cada diagn\u00f3stico y presupuesto.',
  },
  {
    icon: Award,
    title: 'Excelencia',
    text: 'Est\u00e1ndares de calidad que superan las expectativas.',
  },
  {
    icon: Heart,
    title: 'Compromiso',
    text: 'Tratamos cada veh\u00edculo como si fuera el nuestro.',
  },
  {
    icon: Users,
    title: 'Cercan\u00eda',
    text: 'Relaciones duraderas basadas en el trato personal.',
  },
];

const stats = [
  { number: '+20', label: 'A\u00f1os de experiencia' },
  { number: '+5.000', label: 'Clientes satisfechos' },
  { number: '+15.000', label: 'Reparaciones realizadas' },
  { number: '98%', label: 'Valoraci\u00f3n positiva' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15 },
  }),
};

const NosotrosPage = () => {
  return (
    <>
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-28 px-4 md:px-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage:
                'url(https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/90 to-[#050505]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#D4AF37] text-xs sm:text-sm tracking-[0.3em] uppercase mb-4 font-medium"
          >
            Sobre Nosotros
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-white font-['Syne'] tracking-tight mb-6"
          >
            M&aacute;s que un taller,{' '}
            <span className="text-gold-gradient">tu taller</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-[#A3A3A3] text-sm md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            En Castrez Autrans llevamos m&aacute;s de 20 a&ntilde;os cuidando los veh&iacute;culos de
            Terrassa y alrededores con la dedicaci&oacute;n y precisi&oacute;n que solo un taller
            familiar de alta gama puede ofrecer.
          </motion.p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#0A0A0A] border-y border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto px-4 md:px-12 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-[#D4AF37] font-mono mb-1">
                  {stat.number}
                </p>
                <p className="text-[#A3A3A3] text-xs md:text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Objective */}
      <section className="py-16 md:py-28 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Mission */}
            <motion.div
              variants={fadeUp}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group relative glass-card rounded-2xl p-7 md:p-10 hover:border-[#D4AF37]/40 transition-all duration-500"
              data-testid="mission-card"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors">
                <Target size={26} className="text-[#D4AF37]" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white font-['Syne'] mb-4">
                Nuestra Misi&oacute;n
              </h2>
              <p className="text-[#A3A3A3] text-sm leading-relaxed">
                Ofrecer un servicio de mantenimiento y reparaci&oacute;n de veh&iacute;culos de la
                m&aacute;xima calidad, combinando la experiencia artesanal con la tecnolog&iacute;a
                m&aacute;s avanzada. Queremos que cada cliente salga de nuestro taller con la
                tranquilidad de saber que su veh&iacute;culo est&aacute; en las mejores manos y con
                la confianza de un trabajo bien hecho.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group relative glass-card rounded-2xl p-7 md:p-10 hover:border-[#D4AF37]/40 transition-all duration-500 lg:-translate-y-4"
              data-testid="vision-card"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors">
                <Eye size={26} className="text-[#D4AF37]" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white font-['Syne'] mb-4">
                Nuestra Visi&oacute;n
              </h2>
              <p className="text-[#A3A3A3] text-sm leading-relaxed">
                Ser el taller mec&aacute;nico de referencia en Terrassa y el Vall&egrave;s
                Occidental, reconocido por nuestra excelencia t&eacute;cnica, trato personalizado y
                compromiso con la innovaci&oacute;n. Aspiramos a que cada cliente nos elija no por
                obligaci&oacute;n, sino por la confianza que hemos construido durante m&aacute;s de
                dos d&eacute;cadas.
              </p>
            </motion.div>

            {/* Objective */}
            <motion.div
              variants={fadeUp}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group relative glass-card rounded-2xl p-7 md:p-10 hover:border-[#D4AF37]/40 transition-all duration-500"
              data-testid="objective-card"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors">
                <Compass size={26} className="text-[#D4AF37]" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white font-['Syne'] mb-4">
                Nuestro Objetivo
              </h2>
              <p className="text-[#A3A3A3] text-sm leading-relaxed">
                Garantizar la seguridad y el rendimiento &oacute;ptimo de cada veh&iacute;culo que
                pasa por nuestras manos. Nos proponemos ampliar nuestra oferta de recambios de
                calidad, mantener precios competitivos y seguir formando a nuestro equipo en las
                &uacute;ltimas tecnolog&iacute;as del sector automotriz para dar siempre lo mejor.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 px-4 md:px-12 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="text-[#D4AF37] text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 font-medium">
              Lo que nos define
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-white font-['Syne'] tracking-tight">
              Nuestros Valores
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative glass-card rounded-xl p-6 text-center hover:border-[#D4AF37]/30 transition-all group"
                data-testid={`value-${val.title.toLowerCase()}`}
              >
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <val.icon size={22} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2 font-['Syne']">
                  {val.title}
                </h3>
                <p className="text-[#A3A3A3] text-sm leading-relaxed">{val.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white font-['Syne'] mb-4">
              &iquest;Listo para cuidar tu veh&iacute;culo?
            </h2>
            <p className="text-[#A3A3A3] text-sm md:text-base mb-8 max-w-lg mx-auto">
              Conf&iacute;a en un equipo con m&aacute;s de 20 a&ntilde;os de experiencia.
              Reserva tu cita y comprueba la diferencia Castrez Autrans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/citas"
                className="btn-gold px-8 py-4 rounded-full text-sm md:text-base font-semibold"
                data-testid="nosotros-cta-citas"
              >
                Reservar Cita
              </a>
              <a
                href="/recambios"
                className="px-8 py-4 rounded-full text-sm md:text-base font-semibold border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                data-testid="nosotros-cta-recambios"
              >
                Ver Recambios
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default NosotrosPage;
