import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Car, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const services = [
  { value: 'essential', label: 'Pack Essential - 79,90€' },
  { value: 'advance', label: 'Pack Advance - 149,90€' },
  { value: 'premium', label: 'Pack Premium - Desde 229,90€' },
  { value: 'diagnosis', label: 'Diagnosis Computarizada' },
  { value: 'brakes', label: 'Revisión de Frenos' },
  { value: 'other', label: 'Otro Servicio' },
];

const AppointmentSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    license_plate: '',
    service_type: '',
    notes: '',
  });
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.license_plate || !formData.service_type || !date) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/appointments`, {
        ...formData,
        preferred_date: format(date, 'yyyy-MM-dd'),
      });
      
      toast.success('¡Cita solicitada con éxito! Te contactaremos pronto.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        license_plate: '',
        service_type: '',
        notes: '',
      });
      setDate(null);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="citas" className="py-24 md:py-32 px-6 md:px-12" data-testid="appointment-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#D4AF37] text-sm tracking-[0.3em] uppercase mb-4 font-medium">
              Reserva Tu Cita
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-['Syne'] tracking-tight">
              Tu Vehículo,
              <br />
              Nuestra Prioridad
            </h2>
            <p className="text-[#A3A3A3] mb-8 leading-relaxed">
              Reserva tu cita online y olvídate de esperas. Nuestro equipo te contactará para confirmar la fecha y hora que mejor se adapte a tu agenda.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Clock size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-white font-medium">Horario de Atención</p>
                  <p className="text-[#666] text-sm">Lunes a Viernes: 8:00 - 19:00</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Phone size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-white font-medium">Teléfono</p>
                  <a href="tel:+34607665474" className="text-[#666] text-sm hover:text-[#D4AF37] transition-colors">
                    +34 607 665 474
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8" data-testid="appointment-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="relative">
                  <User size={18} className="absolute left-0 top-4 text-[#666]" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre completo *"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-8"
                    data-testid="input-name"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <Phone size={18} className="absolute left-0 top-4 text-[#666]" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Teléfono *"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-8"
                    data-testid="input-phone"
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail size={18} className="absolute left-0 top-4 text-[#666]" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email (opcional)"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-8"
                    data-testid="input-email"
                  />
                </div>

                {/* License Plate */}
                <div className="relative">
                  <Car size={18} className="absolute left-0 top-4 text-[#666]" />
                  <input
                    type="text"
                    name="license_plate"
                    placeholder="Matrícula *"
                    value={formData.license_plate}
                    onChange={handleChange}
                    className="pl-8 uppercase"
                    data-testid="input-license"
                    required
                  />
                </div>

                {/* Service Type */}
                <div className="md:col-span-2">
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, service_type: value }))}
                  >
                    <SelectTrigger className="w-full bg-transparent border-0 border-b border-[#333] rounded-none px-0 py-4 text-white focus:ring-0 focus:border-[#D4AF37]" data-testid="select-service">
                      <SelectValue placeholder="Selecciona un servicio *" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#333]">
                      {services.map((service) => (
                        <SelectItem key={service.value} value={service.value} className="text-white hover:bg-[#262626] focus:bg-[#262626]">
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Picker */}
                <div className="md:col-span-2">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 text-left border-b border-[#333] py-4 text-[#666] hover:border-[#D4AF37] transition-colors"
                        data-testid="date-picker-trigger"
                      >
                        <Calendar size={18} />
                        {date ? (
                          <span className="text-white">{format(date, 'PPP', { locale: es })}</span>
                        ) : (
                          <span>Fecha preferida *</span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-[#333]" align="start">
                      <CalendarUI
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate);
                          setCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                        initialFocus
                        className="bg-[#1A1A1A] text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Notes */}
                <div className="md:col-span-2 relative">
                  <MessageSquare size={18} className="absolute left-0 top-4 text-[#666]" />
                  <textarea
                    name="notes"
                    placeholder="Notas adicionales (opcional)"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="pl-8 resize-none"
                    data-testid="input-notes"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-8 btn-gold py-4 rounded-full text-base font-semibold disabled:opacity-50"
                data-testid="submit-appointment"
              >
                {loading ? 'Enviando...' : 'Solicitar Cita'}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
