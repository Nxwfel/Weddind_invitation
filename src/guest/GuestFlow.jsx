import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import InvitationCard from './InvitationCard';

// Floating particle component for background ambience
const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full bg-[#d9f99d]/10 pointer-events-none"
    style={style}
    animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
    transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
  />
);

export default function GuestFlow() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestData, setGuestData] = useState(null);
  const [eventData, setEventData] = useState({
    groom_name: 'Mohammed Kandousi',
    bride_name: 'Aisha',
  });
  const [isRevealed, setIsRevealed] = useState(false);

  // Pre-fetch event data in the background so it's ready when guest validates
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await apiClient.get('/event/1');
        if (res.data) setEventData(res.data);
      } catch {
        // Silent — fallback names already set
      }
    };
    fetchEvent();
  }, []);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setError('');
    setLoading(true);
    try {
      // Code is a UUID — send exactly as typed (no case transform)
      const res = await apiClient.get(`/invitations/code/${trimmed}`);
      const data = res.data;

      if (data && data.is_valid === false) {
        setError('This invitation is no longer valid. Please contact the organiser.');
        return;
      }

      setGuestData(data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError('Invitation code not found. Please double-check and try again.');
      } else {
        // FastAPI returns errors under `detail`
        const msg = err.response?.data?.detail || err.response?.data?.message || 'Something went wrong. Please try again.';
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    } finally {
      setLoading(false);
    }
  };

  if (guestData) {
    return <InvitationCard guest={guestData} event={eventData} />;
  }

  const particles = Array.from({ length: 12 }, (_, i) => ({
    width: 4 + Math.random() * 12,
    height: 4 + Math.random() * 12,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${i * 0.4}s`,
  }));

  return (
    <div className="min-h-screen bg-[#1b3312] flex flex-col items-center justify-center font-sans-clean overflow-hidden relative">
      {/* Ambient particles */}
      {particles.map((p, i) => (
        <Particle key={i} style={{ width: p.width, height: p.height, top: p.top, left: p.left }} />
      ))}

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(217,249,157,0.07) 0%, transparent 70%)' }}
      />

      <AnimatePresence mode="wait">
        {!isRevealed ? (
          /* ── PRELOADER ── */
          <motion.div
            key="preloader"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center cursor-pointer group select-none"
            onClick={() => setIsRevealed(true)}
          >
            {/* Animated interlocking rings */}
            <div className="relative w-36 h-36 md:w-44 md:h-44 mb-10">
              <svg className="w-full h-full overflow-visible text-[#d9f99d]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.6">
                <motion.circle
                  cx="38" cy="50" r="26"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2.2, ease: 'easeInOut' }}
                />
                <motion.circle
                  cx="62" cy="50" r="26"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2.2, delay: 0.6, ease: 'easeInOut' }}
                />
                {/* small decorative diamond */}
                <motion.path
                  d="M50 20 L54 26 L50 32 L46 26 Z"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1, delay: 1.8 }}
                />
              </svg>
              {/* Pulsing glow behind rings */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(217,249,157,0.12) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="font-serif-elegant text-4xl md:text-5xl text-[#f4f7f4] tracking-[0.15em] font-light mb-2 text-center"
            >
              {eventData.groom_name}
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="w-16 h-px bg-[#8ea685] mb-2"
            />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="font-serif-elegant text-4xl md:text-5xl text-[#d9f99d] tracking-[0.15em] font-light mb-10 text-center"
            >
              {eventData.bride_name}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.8 }}
              className="font-sans-clean text-[10px] tracking-[0.5em] text-[#8ea685] uppercase group-hover:text-[#d9f99d] transition-colors duration-500"
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Tap to open your invitation
              </motion.span>
            </motion.p>
          </motion.div>
        ) : (
          /* ── CODE INPUT ── */
          <motion.div
            key="code-input"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center w-full max-w-md px-8"
          >
            {/* Back to preloader */}
            <button
              onClick={() => { setIsRevealed(false); setError(''); setCode(''); }}
              className="mb-10 text-[#8ea685]/60 hover:text-[#8ea685] transition-colors text-xs tracking-widest uppercase flex items-center gap-2"
            >
              ← Back
            </button>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-10"
            >
              <h3 className="font-serif-elegant text-3xl md:text-4xl text-[#f4f7f4] tracking-wider mb-3">
                Enter Your<br />Invitation Code
              </h3>
              <p className="font-sans-clean text-xs text-[#8ea685] tracking-widest">
                Your code was shared with you by the organiser
              </p>
            </motion.div>

            <form onSubmit={handleVerifyCode} className="w-full flex flex-col gap-6">
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(''); }}
                  placeholder="Paste your code here"
                  className={`w-full bg-transparent border-b-2 text-[#f4f7f4] text-center text-base pb-3 pt-2 focus:outline-none tracking-widest placeholder:text-[#8ea685]/30 transition-colors font-mono ${
                    error ? 'border-red-400' : 'border-[#8ea685]/40 focus:border-[#d9f99d]'
                  }`}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm text-center leading-relaxed -mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="relative overflow-hidden border border-[#8ea685] text-[#8ea685] hover:bg-[#8ea685] hover:text-[#1b3312] transition-all duration-300 py-3.5 uppercase tracking-[0.3em] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <motion.span
                  className="absolute inset-0 bg-[#d9f99d] origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ zIndex: 0 }}
                />
                <span className="relative z-10 group-hover:text-[#1b3312] transition-colors">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-4 h-4 border border-current border-t-transparent rounded-full"
                      />
                      Verifying…
                    </span>
                  ) : 'Open Invitation'}
                </span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
