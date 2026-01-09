import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MetahodosButton, MetahodosInput, MetahodosCard } from '../../components/ui';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const PasswordResetPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const { resetPassword } = useAuth();

  // Validate email
  function validateEmail(): boolean {
    if (!email) {
      setError('Email obbligatoria');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email non valida');
      return false;
    }

    setError('');
    return true;
  }

  // Handle password reset
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateEmail()) return;

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      toast.success('Email di recupero inviata!');
    } catch (error: any) {
      console.error('Password reset error:', error);

      if (error.code === 'auth/user-not-found') {
        setError('Email non registrata');
        toast.error('Email non registrata');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email non valida');
        toast.error('Email non valida');
      } else {
        toast.error('Errore durante l\'invio dell\'email');
      }
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (emailSent) {
    return (
      <div className="min-h-screen bg-metahodos-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-metahodos-navy">Email inviata!</h1>
          </div>

          <MetahodosCard>
            <div className="text-center space-y-4">
              <p className="text-metahodos-text-primary">
                Abbiamo inviato un link per reimpostare la password a:
              </p>
              <p className="text-metahodos-orange font-medium">{email}</p>
              <p className="text-sm text-metahodos-text-secondary">
                Controlla la tua casella email e segui le istruzioni per reimpostare la
                password.
              </p>
              <p className="text-sm text-metahodos-text-muted">
                Non hai ricevuto l'email? Controlla la cartella spam o{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-metahodos-orange hover:underline"
                >
                  riprova
                </button>
              </p>
            </div>

            <div className="mt-6">
              <Link to="/login">
                <MetahodosButton variant="primary" fullWidth leftIcon={<ArrowLeftIcon className="h-5 w-5" />}>
                  Torna al login
                </MetahodosButton>
              </Link>
            </div>
          </MetahodosCard>
        </div>
      </div>
    );
  }

  // Form state
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
          <h1 className="text-3xl font-bold text-metahodos-navy">Password dimenticata?</h1>
          <p className="mt-2 text-metahodos-text-secondary">
            Inserisci la tua email per ricevere il link di recupero
          </p>
        </div>

        <MetahodosCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <MetahodosInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              placeholder="tuo@email.com"
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
              Invia link di recupero
            </MetahodosButton>
          </form>

          {/* Back to login link */}
          <div className="mt-6">
            <Link to="/login">
              <MetahodosButton variant="ghost" fullWidth leftIcon={<ArrowLeftIcon className="h-5 w-5" />}>
                Torna al login
              </MetahodosButton>
            </Link>
          </div>
        </MetahodosCard>
      </div>
    </div>
  );
};
