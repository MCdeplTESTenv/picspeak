/*
 * PIN dell'adulto e codice di recupero.
 * Il PIN non viene mai salvato: si conserva solo un'impronta (PBKDF2-SHA256 con sale casuale).
 * Dopo 3 tentativi sbagliati l'attesa cresce (30 s, 60 s, 120 s… fino a 15 minuti).
 * Limite: senza server la protezione ferma il bambino e l'adulto non autorizzato,
 * non chi ha competenze tecniche e il dispositivo in mano.
 */
(function () {
  'use strict';

  const { storage } = window.PicSpeak;

  const ITERATIONS = 150000;
  const FREE_ATTEMPTS = 3;
  const BASE_LOCK_SECONDS = 30;
  const MAX_LOCK_SECONDS = 15 * 60;
  // Alfabeto senza caratteri ambigui (0/O, 1/I/L)
  const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  const supported = Boolean(window.crypto && window.crypto.subtle && window.TextEncoder);

  function toHex(buffer) {
    return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('');
  }

  function fromHex(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    return bytes;
  }

  function randomHex(length) {
    return toHex(crypto.getRandomValues(new Uint8Array(length)));
  }

  async function derive(secret, saltHex, iterations) {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits'],
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: fromHex(saltHex), iterations, hash: 'SHA-256' }, key, 256,
    );
    return toHex(bits);
  }

  function normalizeCode(code) {
    return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function makeRecoveryCode() {
    const values = crypto.getRandomValues(new Uint8Array(12));
    const chars = Array.from(values, (v) => CODE_ALPHABET[v % CODE_ALPHABET.length]).join('');
    return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
  }

  function isValidPin(pin) {
    return /^\d{4,6}$/.test(String(pin || ''));
  }

  async function hasPin() {
    const data = await storage.get('security');
    return Boolean(data && data.pinHash);
  }

  // Salva un nuovo PIN; con newRecovery crea anche un nuovo codice di recupero e lo restituisce
  async function setPin(pin, { newRecovery }) {
    const previous = (await storage.get('security')) || {};
    const pinSalt = randomHex(16);
    const data = {
      ...previous,
      iterations: ITERATIONS,
      pinSalt,
      pinHash: await derive(pin, pinSalt, ITERATIONS),
    };
    let recoveryCode = null;
    if (newRecovery || !previous.recoveryHash) {
      recoveryCode = makeRecoveryCode();
      data.recoverySalt = randomHex(16);
      data.recoveryHash = await derive(normalizeCode(recoveryCode), data.recoverySalt, ITERATIONS);
    }
    await storage.set('security', data);
    await storage.set('securityAttempts', { fails: 0, lockUntil: 0 });
    return recoveryCode;
  }

  async function lockStatus() {
    const attempts = (await storage.get('securityAttempts')) || { fails: 0, lockUntil: 0 };
    const waitSeconds = Math.ceil((attempts.lockUntil - Date.now()) / 1000);
    return { attempts, waitSeconds: waitSeconds > 0 ? waitSeconds : 0 };
  }

  async function registerResult(ok, attempts) {
    if (ok) {
      await storage.set('securityAttempts', { fails: 0, lockUntil: 0 });
      return 0;
    }
    const fails = attempts.fails + 1;
    let lockUntil = 0;
    if (fails >= FREE_ATTEMPTS) {
      const seconds = Math.min(BASE_LOCK_SECONDS * 2 ** (fails - FREE_ATTEMPTS), MAX_LOCK_SECONDS);
      lockUntil = Date.now() + seconds * 1000;
    }
    await storage.set('securityAttempts', { fails, lockUntil });
    return lockUntil ? Math.ceil((lockUntil - Date.now()) / 1000) : 0;
  }

  async function check(secret, saltKey, hashKey) {
    const { attempts, waitSeconds } = await lockStatus();
    if (waitSeconds) return { ok: false, waitSeconds };
    const data = await storage.get('security');
    if (!data || !data[hashKey]) return { ok: false, waitSeconds: 0 };
    const hash = await derive(secret, data[saltKey], data.iterations || ITERATIONS);
    const ok = hash === data[hashKey];
    const wait = await registerResult(ok, attempts);
    return { ok, waitSeconds: wait };
  }

  function verifyPin(pin) {
    return check(String(pin || ''), 'pinSalt', 'pinHash');
  }

  function verifyRecovery(code) {
    return check(normalizeCode(code), 'recoverySalt', 'recoveryHash');
  }

  window.PicSpeak.security = {
    supported, isValidPin, hasPin, setPin, verifyPin, verifyRecovery,
  };
})();
