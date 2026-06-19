import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../Services/AuthContext';
import {
  getPerfil,
  updatePerfil,
  getMisOrdenes,
  type PerfilData,
  type Orden,
} from '../../Services/usuario.service';
import './Profile.css';

const DISTRITOS = [
  'Miraflores','San Isidro','Surco','La Molina','San Borja','Barranco',
  'Magdalena','Pueblo Libre','Jesús María','Lince','San Miguel','Breña',
  'Rímac','La Victoria','Ate','Vitarte','San Juan de Lurigancho','Comas',
  'Los Olivos','Independencia','El Agustino','Villa El Salvador',
  'Villa María del Triunfo','San Juan de Miraflores','Chorrillos','Callao','Otro distrito',
];

export default function Profile() {
  const { isAuthenticated, userEmail } = useAuth();

  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [loadingOrdenes, setLoadingOrdenes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedOrden, setExpandedOrden] = useState<number | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    distrito: '',
    dni: '',
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    getPerfil()
      .then((data) => {
        setPerfil(data);
        setForm({
          nombre: data.nombre ?? '',
          telefono: data.telefono ?? '',
          direccion: data.direccion ?? '',
          distrito: data.distrito ?? '',
          dni: data.dni ?? '',
        });
      })
      .catch(() => toast.error('No se pudo cargar el perfil'))
      .finally(() => setLoadingPerfil(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingOrdenes(true);
    getMisOrdenes()
      .then(setOrdenes)
      .catch(() => toast.error('No se pudo cargar el historial'))
      .finally(() => setLoadingOrdenes(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updatePerfil(form);
      setPerfil(updated);
      toast.success('Perfil actualizado correctamente');
    } catch {
      toast.error('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {userEmail?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <h2 className="profile-name">{perfil?.nombre || 'Mi Perfil'}</h2>
          <p className="profile-email">{userEmail}</p>
          <span className="profile-role">{perfil?.role ?? 'USER'}</span>
        </div>
      </div>

      <div className="profile-card profile-card--wide">
        {loadingPerfil ? (
          <p className="profile-loading">Cargando...</p>
        ) : (
          <div className="profile-form">
            <div className="profile-field">
              <label>Nombre completo</label>
              <input
                type="text"
                value={form.nombre}
                placeholder="Ej: Juan Pérez"
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <div className="profile-field">
              <label>Teléfono</label>
              <input
                type="text"
                value={form.telefono}
                placeholder="9 dígitos"
                maxLength={9}
                onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <div className="profile-field">
              <label>DNI</label>
              <input
                type="text"
                value={form.dni}
                placeholder="8 dígitos"
                maxLength={8}
                onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <div className="profile-field">
              <label>Dirección de envío</label>
              <input
                type="text"
                value={form.direccion}
                placeholder="Av. Ejemplo 123, Dpto 4B"
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              />
            </div>

            <div className="profile-field">
              <label>Distrito</label>
              <select
                value={form.distrito}
                onChange={(e) => setForm({ ...form, distrito: e.target.value })}
              >
                <option value="">Selecciona un distrito</option>
                {DISTRITOS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <button
              className="profile-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>

      <div className="profile-card profile-card--wide profile-ordenes">
        <h3 className="ordenes-title">Mis órdenes</h3>
        {loadingOrdenes ? (
          <p className="profile-loading">Cargando órdenes...</p>
        ) : ordenes.length === 0 ? (
          <div className="profile-empty">
            <i className="fi fi-rs-box-alt" />
            <p>No tienes órdenes aún</p>
          </div>
        ) : (
          <div className="ordenes-list">
            {ordenes.map((orden) => (
              <div key={orden.id} className="orden-card">
                <div
                  className="orden-header"
                  onClick={() => setExpandedOrden(expandedOrden === orden.id ? null : orden.id)}
                >
                  <div className="orden-meta">
                    <span className="orden-id">#{String(orden.id).padStart(6, '0')}</span>
                    <span className="orden-date">{formatDate(orden.createdAt)}</span>
                  </div>
                  <div className="orden-right">
                    <span className={`orden-estado orden-estado--${orden.estado.toLowerCase()}`}>
                      {orden.estado}
                    </span>
                    <strong className="orden-total">S/ {orden.total.toFixed(2)}</strong>
                    <i className={`fi fi-rs-angle-${expandedOrden === orden.id ? 'up' : 'down'}`} />
                  </div>
                </div>

                {expandedOrden === orden.id && (
                  <div className="orden-detail">
                    <table className="orden-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>P. Unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orden.items.map((item, i) => (
                          <tr key={i}>
                            <td>{item.productoNombre}</td>
                            <td>{item.cantidad}</td>
                            <td>S/ {item.precioUnitario.toFixed(2)}</td>
                            <td>S/ {item.subtotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="orden-totals">
                      <div className="orden-total-row">
                        <span>Base imponible</span>
                        <span>S/ {orden.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="orden-total-row">
                        <span>IGV 18%</span>
                        <span>S/ {orden.igv.toFixed(2)}</span>
                      </div>
                      <div className="orden-total-row">
                        <span>Envío ({orden.distrito})</span>
                        <span>{orden.envio === 0 ? 'Gratis' : `S/ ${orden.envio.toFixed(2)}`}</span>
                      </div>
                      <div className="orden-total-row orden-total-final">
                        <span>Total pagado</span>
                        <strong>S/ {orden.total.toFixed(2)}</strong>
                      </div>
                      <div className="orden-total-row">
                        <span>Método de pago</span>
                        <span>{orden.metodoPago === 'card' ? 'Tarjeta' : 'Transferencia / QR'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}