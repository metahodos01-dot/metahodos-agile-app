import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MetahodosButton, MetahodosInput, MetahodosCard } from '../../components/ui';
import toast from 'react-hot-toast';

export const SignupPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Validate form
  function validateForm(): boolean {
    const newErrors: {
      displayName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!displayName || displayName.trim().length < 2) {
      newErrors.displayName = 'Nome deve essere almeno 2 caratteri';
    }

    if (!email) {
      newErrors.email = 'Email obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email non valida';
    }

    if (!password) {
      newErrors.password = 'Password obbligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'Password deve essere almeno 6 caratteri';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handle email/password signup
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup(email, password, displayName);
      toast.success(
        'Registrazione completata! Controlla la tua email per verificare l\'account.'
      );
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);

      // Firebase error messages
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email già registrata');
        setErrors({ email: 'Email già registrata' });
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email non valida');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password troppo debole');
        setErrors({ password: 'Password troppo debole' });
      } else {
        toast.error('Errore durante la registrazione');
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle Google signup
  async function handleGoogleSignup() {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Registrazione con Google completata!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Google signup error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Registrazione annullata');
      } else {
        toast.error('Errore durante la registrazione con Google');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-metahodos-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/metahodos-logo.svg"
              alt="Metahodos Logo"
              className="h-16 w-16 object-contain"
              onError={(e) => {
                // Fallback to letter logo if image not found
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-16 h-16 bg-metahodos-orange rounded-lg items-center justify-center hidden">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-metahodos-navy">Crea il tuo account</h1>
          <p className="mt-2 text-metahodos-text-secondary">
            Inizia a gestire i tuoi progetti Agile
          </p>
        </div>

        <MetahodosCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <MetahodosInput
              label="Nome completo"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={errors.displayName}
              placeholder="Mario Rossi"
              disabled={loading}
              required
            />

            {/* Email */}
            <MetahodosInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="tuo@email.com"
              disabled={loading}
              required
            />

            {/* Password */}
            <MetahodosInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••••"
              helperText="Minimo 6 caratteri"
              disabled={loading}
              required
            />

            {/* Confirm Password */}
            <MetahodosInput
              label="Conferma password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="••••••••"
              disabled={loading}
              required
            />

            {/* Submit button */}
            <MetahodosButton
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              disabled={loading}
            >
              Registrati
            </MetahodosButton>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-metahodos-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-metahodos-text-secondary">Oppure</span>
              </div>
            </div>

            {/* Google Sign-In */}
            <MetahodosButton
              type="button"
              variant="outline"
              fullWidth
              onClick={handleGoogleSignup}
              disabled={loading}
              leftIcon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              }
            >
              Continua con Google
            </MetahodosButton>
          </form>

          {/* Terms */}
          <p className="mt-4 text-xs text-center text-metahodos-text-muted">
            Registrandoti, accetti i nostri{' '}
            <a href="#" className="text-metahodos-orange hover:underline">
              Termini di Servizio
            </a>{' '}
            e{' '}
            <a href="#" className="text-metahodos-orange hover:underline">
              Privacy Policy
            </a>
          </p>

          {/* Login link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-metahodos-text-secondary">Hai già un account? </span>
            <Link
              to="/login"
              className="text-metahodos-orange hover:text-metahodos-orange-dark font-medium transition-colors"
            >
              Accedi
            </Link>
          </div>
        </MetahodosCard>
      </div>
    </div>
  );
};
