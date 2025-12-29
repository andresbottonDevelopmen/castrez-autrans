const LOGO_URL = 'https://customer-assets.emergentagent.com/job_1c5df42d-6505-4d6c-97c6-dd11a75d6657/artifacts/f0cxn3lf_logo%20castrez.avif';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] border-t border-[#1A1A1A] py-12 px-6 md:px-12" data-testid="footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src={LOGO_URL} alt="Castrez Autrans" className="h-12 mb-4" />
            <p className="text-[#A3A3A3] text-sm max-w-md">
              Taller mecánico de alta gama en Terrassa. Más de 20 años cuidando de tu vehículo con precisión y excelencia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <a href="#servicios" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#recambios" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  Recambios
                </a>
              </li>
              <li>
                <a href="#citas" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  Reservar Cita
                </a>
              </li>
              <li>
                <a href="#ubicacion" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  Ubicación
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-[#A3A3A3] text-sm">
              <li>
                <a href="tel:+34607665474" className="hover:text-[#D4AF37] transition-colors">
                  +34 607 665 474
                </a>
              </li>
              <li>
                <a href="mailto:info@castrezautrans.com" className="hover:text-[#D4AF37] transition-colors">
                  info@castrezautrans.com
                </a>
              </li>
              <li>Carrer Masnou 25</li>
              <li>08221 Terrassa, Barcelona</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#1A1A1A] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#666] text-sm">
            © {currentYear} Castrez Autrans. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="/admin" className="text-[#666] text-sm hover:text-[#A3A3A3] transition-colors">
              Admin
            </a>
            <a href="#" className="text-[#666] text-sm hover:text-[#A3A3A3] transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="text-[#666] text-sm hover:text-[#A3A3A3] transition-colors">
              Aviso Legal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
