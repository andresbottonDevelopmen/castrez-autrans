import { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = ['#D4AF37', '#10B981', '#EF4444', '#3B82F6'];

const ReportsManager = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    date_from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/stats/attendance`, { params: dateRange });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const exportToExcel = async () => {
    try {
      const response = await axios.get(`${API}/admin/reports/attendance/excel`, {
        params: dateRange,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${dateRange.date_from}_a_${dateRange.date_to}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Reporte descargado');
    } catch (error) {
      toast.error('Error al exportar');
    }
  };

  const pieData = stats ? [
    { name: 'Puntuales', value: stats.summary.on_time },
    { name: 'Tardíos', value: stats.summary.late },
  ] : [];

  const barData = stats?.by_employee?.slice(0, 10).map(emp => ({
    name: emp.employee_name.split(' ')[0],
    horas: Math.round(emp.total_hours),
    dias: emp.total_days,
  })) || [];

  return (
    <div data-testid="reports-manager">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Syne']">Reportes</h1>
          <p className="text-[#A3A3A3]">Estadísticas y análisis de asistencia</p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-500 rounded-full" data-testid="export-report-btn">
            <Download size={18} className="mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[#A3A3A3] text-sm mb-1 block">Desde</label>
            <input
              type="date"
              value={dateRange.date_from}
              onChange={(e) => setDateRange({ ...dateRange, date_from: e.target.value })}
              className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-[#A3A3A3] text-sm mb-1 block">Hasta</label>
            <input
              type="date"
              value={dateRange.date_to}
              onChange={(e) => setDateRange({ ...dateRange, date_to: e.target.value })}
              className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
            />
          </div>
          <Button onClick={fetchStats} className="btn-gold rounded-lg">
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#A3A3A3]">Cargando estadísticas...</div>
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                  <BarChart3 size={20} className="text-[#D4AF37]" />
                </div>
                <span className="text-[#A3A3A3] text-sm">Total Registros</span>
              </div>
              <p className="text-3xl font-bold text-white font-mono">{stats.summary.total_records}</p>
            </div>

            <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Clock size={20} className="text-blue-400" />
                </div>
                <span className="text-[#A3A3A3] text-sm">Horas Totales</span>
              </div>
              <p className="text-3xl font-bold text-white font-mono">{stats.summary.total_hours}h</p>
            </div>

            <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Users size={20} className="text-green-400" />
                </div>
                <span className="text-[#A3A3A3] text-sm">Empleados</span>
              </div>
              <p className="text-3xl font-bold text-white font-mono">{stats.summary.total_employees}</p>
            </div>

            <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-yellow-400" />
                </div>
                <span className="text-[#A3A3A3] text-sm">Retardos</span>
              </div>
              <p className="text-3xl font-bold text-white font-mono">{stats.summary.late}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart - Hours by Employee */}
            <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#D4AF37]" />
                Horas por Empleado (Top 10)
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="name" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="horas" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Punctuality */}
            <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock size={18} className="text-[#D4AF37]" />
                Puntualidad
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                  <span className="text-[#A3A3A3] text-sm">Puntuales ({stats.summary.on_time})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="text-[#A3A3A3] text-sm">Tardíos ({stats.summary.late})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Details Table */}
          <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Rendimiento por Empleado</h3>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Días Trabajados</th>
                    <th>Horas Totales</th>
                    <th>Retardos</th>
                    <th>Promedio/Día</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.by_employee.map((emp) => (
                    <tr key={emp.employee_id}>
                      <td className="text-white font-medium">{emp.employee_name}</td>
                      <td className="font-mono text-[#A3A3A3]">{emp.total_days}</td>
                      <td className="font-mono text-[#D4AF37]">{emp.total_hours.toFixed(1)}h</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          emp.late_days === 0
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {emp.late_days}
                        </span>
                      </td>
                      <td className="font-mono text-[#A3A3A3]">
                        {emp.total_days > 0 ? (emp.total_hours / emp.total_days).toFixed(1) : 0}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-[#A3A3A3]">No hay datos disponibles</div>
      )}
    </div>
  );
};

export default ReportsManager;
