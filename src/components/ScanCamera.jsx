import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const READER_ID = 'rc-qr-reader';

function InfoRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.15)',
    }}>
      <span style={{ fontSize: 13, opacity: 0.8 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function ResultScreen({ result, onNext }) {
  const ok = !!result.autorise;
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: ok ? '#16a34a' : '#dc2626',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 32px',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      color: '#fff', zIndex: 200, textAlign: 'center',
    }}>
      <div style={{
        fontSize: 100, fontWeight: 900, lineHeight: 1, marginBottom: 12,
        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        {ok ? '✓' : '✗'}
      </div>
      <h1 style={{
        fontSize: 28, fontWeight: 800, letterSpacing: '3px', margin: '0 0 24px',
        textShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        {ok ? 'ACCÈS AUTORISÉ' : 'ACCÈS REFUSÉ'}
      </h1>

      <div style={{
        width: '100%', maxWidth: 360,
        background: 'rgba(0,0,0,0.22)',
        backdropFilter: 'blur(8px)',
        borderRadius: 16, padding: '12px 20px', marginBottom: 32,
      }}>
        {ok ? (
          <>
            <InfoRow label="Visiteur" value={result.visiteur?.nom} />
            <InfoRow label="Type" value={result.visiteur?.type} />
            <InfoRow label="Résident" value={result.resident_nom} />
            <InfoRow label="Appartement" value={result.appartement} />
            <InfoRow label="Utilisations restantes" value={result.utilisations_restantes} />
          </>
        ) : (
          <p style={{ margin: '8px 0', fontSize: 15, opacity: 0.95 }}>
            {result.raison || 'Accès non autorisé'}
          </p>
        )}
      </div>

      <button
        onClick={onNext}
        style={{
          padding: '14px 36px',
          background: 'rgba(0,0,0,0.25)',
          border: '2px solid rgba(255,255,255,0.55)',
          borderRadius: 12, color: '#fff',
          fontSize: 16, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', backdropFilter: 'blur(10px)',
        }}
      >
        Scanner le suivant
      </button>
    </div>
  );
}

export default function ScanCamera({ residenceId, residenceNom, onLogout }) {
  const [phase, setPhase] = useState('scanning');
  const [result, setResult] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const html5Ref = useRef(null);
  const handlingRef = useRef(false);
  const isReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const container = document.getElementById(READER_ID);
    if (container) container.innerHTML = '';

    const qr = new Html5Qrcode(READER_ID);
    html5Ref.current = qr;
    isReadyRef.current = false;

    const cfg = { fps: 10, qrbox: { width: 250, height: 250 } };

    async function onScanSuccess(token) {
      if (handlingRef.current) return;
      handlingRef.current = true;
      if (isReadyRef.current) {
        try { qr.pause(); } catch (e) { console.warn('Scanner pause failed:', e); }
      }
      setPhase('verifying');
      try {
        const base = process.env.REACT_APP_API_URL || '';
        const res = await fetch(`${base}/api/scan/verifier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, residence_id: Number(residenceId) }),
        });
        const data = await res.json();
        setResult(data);
      } catch {
        setResult({ autorise: false, raison: 'Erreur réseau. Veuillez réessayer.' });
      }
      setPhase('result');
    }

    async function start() {
      try {
        await qr.start({ facingMode: 'environment' }, cfg, onScanSuccess, () => {});
        if (cancelled) { try { qr.stop(); } catch (_) {} return; }
        isReadyRef.current = true;
      } catch {
        try {
          try { await qr.stop(); } catch (_) {}
          await qr.start({ facingMode: 'user' }, cfg, onScanSuccess, () => {});
          if (cancelled) { try { qr.stop(); } catch (_) {} return; }
          isReadyRef.current = true;
        } catch (err) {
          if (!cancelled) {
            const msg = (err?.message || '').toLowerCase();
            if (msg.includes('permission') || msg.includes('notallowed')) {
              setCameraError("Accès à la caméra refusé. Autorisez l'accès dans les paramètres du navigateur.");
            } else if (msg.includes('notfound') || msg.includes('no camera')) {
              setCameraError('Aucune caméra détectée sur cet appareil.');
            } else {
              setCameraError("Impossible d'accéder à la caméra. Vérifiez que vous utilisez HTTPS.");
            }
          }
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      isReadyRef.current = false;
      try { qr.stop(); } catch (e) { console.warn('Scanner stop failed:', e); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNextScan() {
    handlingRef.current = false;
    setResult(null);
    setPhase('scanning');
    if (html5Ref.current && isReadyRef.current) {
      try { html5Ref.current.resume(); } catch (e) { console.warn('Scanner resume failed:', e); }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      color: '#e2e8f0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px',
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#4ade80', boxShadow: '0 0 6px #4ade80',
          }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>
            {residenceNom}
          </span>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '6px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: '#94a3b8', fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Changer
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
          Pointez la caméra vers le QR code du visiteur
        </p>

        {cameraError ? (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 16, padding: '36px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📷</div>
            <p style={{ margin: 0, color: '#fca5a5', fontSize: 14, lineHeight: 1.6 }}>
              {cameraError}
            </p>
          </div>
        ) : (
          <div style={{
            width: '100%', borderRadius: 16, overflow: 'hidden',
            border: '2px solid rgba(99,102,241,0.3)',
            boxShadow: '0 0 40px rgba(99,102,241,0.12)',
            background: '#000',
          }}>
            <div id={READER_ID} style={{ width: '100%' }} />
          </div>
        )}
      </div>

      {/* Verifying overlay */}
      {phase === 'verifying' && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.82)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, zIndex: 100,
        }}>
          <div style={{
            width: 52, height: 52,
            border: '4px solid rgba(99,102,241,0.3)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'rc-spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#e2e8f0', fontSize: 16, margin: 0 }}>Vérification en cours…</p>
        </div>
      )}

      {/* Result full-screen overlay */}
      {phase === 'result' && result && (
        <ResultScreen result={result} onNext={handleNextScan} />
      )}

      <style>{`
        @keyframes rc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        #${READER_ID} video { width: 100% !important; height: auto !important; display: block; }
        #${READER_ID} img { display: none !important; }
      `}</style>
    </div>
  );
}
