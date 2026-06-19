import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../Services/AuthContext';
import './Register.css';

type RegisterForm = {
  email: string;
  password: string;
  telefono: string;
  dni: string;
  distrito: string;
};

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const [error, setError] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    mode: 'onSubmit'
  });

  const onSubmit = async ({
    email,
    password,
    telefono,
    dni,
    distrito
  }: RegisterForm) => {
    setError(null);

    try {
      await registerUser(email, password, telefono, dni, distrito);
      navigate('/', { replace: true });
    } catch (error: any) {
    const msg = error?.message ?? '';
    if (msg.includes('conexión')) {
      setError(msg);
    } else {
      setError('No se pudo registrar el usuario');
    }}
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Registro</h2>

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="auth-input"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              {...register('email', {
                required: true
              })}
            />
            {errors.email && (
              <p className="auth-error">
                Email requerido
              </p>
            )}
          </div>

          <div className="auth-field">
            <label
              className="auth-label"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              className="auth-input"
              type="password"
              autoComplete="new-password"
              placeholder="mínimo 8 caracteres"
              {...register('password', {
                required: true,
                minLength: 8
              })}
            />
            {errors.password && (
              <p className="auth-error">
                Password mínimo 8 caracteres
              </p>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="telefono">
              Teléfono
            </label>
            <input
              id="telefono"
              className="auth-input"
              type="tel"
              autoComplete="tel"
              placeholder="987654321"
              {...register('telefono', {
                required: true,
                minLength: 6,
                maxLength: 15
              })}
            />
            {errors.telefono && (
              <p className="auth-error">
                Teléfono requerido
              </p>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="dni">
              DNI
            </label>
            <input
              id="dni"
              className="auth-input"
              type="text"
              autoComplete="off"
              placeholder="12345678"
              {...register('dni', {
                required: true,
                minLength: 6,
                maxLength: 12
              })}
            />
            {errors.dni && (
              <p className="auth-error">
                DNI requerido
              </p>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="distrito">
              Distrito
            </label>
            <input
              id="distrito"
              className="auth-input"
              type="text"
              autoComplete="address-level2"
              placeholder="Miraflores"
              {...register('distrito', {
                required: true,
                minLength: 3
              })}
            />
            {errors.distrito && (
              <p className="auth-error">
                Distrito requerido
              </p>
            )}
          </div>

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button
            className="hero-button auth-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
