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

// Nạp hồ sơ users/{uid}; tạo mới nếu chưa có (role theo ADMIN_EMAILS).
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
    active: true,
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
  return profile;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try { setProfile(await loadOrCreateProfile(u)); }
        catch (e) { console.error('Load profile failed:', e); setProfile(null); }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!firebaseEnabled || !auth.currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (snap.exists()) setProfile(snap.data());
    } catch (e) { console.error('Refresh profile failed:', e); }
  }, []);

  const login  = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const signup = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
  const logout = () => signOut(auth);

  const role = profile?.role || null;

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, login, signup, logout, refreshProfile, firebaseEnabled }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
