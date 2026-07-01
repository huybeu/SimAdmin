import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, firebaseEnabled } from '../firebase';
import { ADMIN_EMAILS } from '../lib/roles';

const AuthContext = createContext(null);

async function loadOrCreateProfile(u) {
  const ref = doc(db, 'users', u.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const role = ADMIN_EMAILS.includes((u.email || '').toLowerCase()) ? 'admin' : 'dai_ly';
  const profile = {
    uid: u.uid,
    email: u.email || '',
    role,
    displayName: u.displayName || u.email || '',
    parentId: null,
    markupVnd: 0,
    creditLimit: 0,
    totalDebt: 0,
    active: true,
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
  return profile;
}

async function loadWithRetry(u, maxAttempts = 3) {
  let lastErr;
  for (let i = 0; i < maxAttempts; i++) {
    try { return await loadOrCreateProfile(u); }
    catch (e) {
      lastErr = e;
      if (i < maxAttempts - 1) await new Promise(r => setTimeout(r, 1200));
    }
  }
  throw lastErr;
}

export function AuthProvider({ children }) {
  const [user, setUser]                 = useState(null);
  const [profile, setProfile]           = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [loading, setLoading]           = useState(firebaseEnabled);
  const [authenticated, setAuthenticated] = useState(!firebaseEnabled);

  const doLoadProfile = useCallback(async (u) => {
    if (!u) { setProfile(null); setProfileError(null); return; }
    setProfileError(null);
    try {
      setProfile(await loadWithRetry(u));
    } catch (e) {
      console.error('Load profile failed after retries:', e);
      setProfile(null);
      setProfileError(e.message || 'Không thể tải hồ sơ. Kiểm tra Firestore Rules.');
    }
  }, []);

  useEffect(() => {
    if (!firebaseEnabled) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthenticated(!!u);
      await doLoadProfile(u);
      setLoading(false);
    });
    return unsub;
  }, [doLoadProfile]);

  const retryProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    await doLoadProfile(auth.currentUser);
    setLoading(false);
  }, [doLoadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!firebaseEnabled || !auth.currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (snap.exists()) setProfile(snap.data());
    } catch (e) { console.error('Refresh profile failed:', e); }
  }, []);

  const login  = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const signup = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
  const logout = async () => {
    if (firebaseEnabled) await signOut(auth);
    setAuthenticated(false);
  };

  const role = profile?.role || null;

  return (
    <AuthContext.Provider value={{
      user, profile, role, loading, authenticated,
      profileError, retryProfile,
      login, signup, logout, refreshProfile, firebaseEnabled,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
