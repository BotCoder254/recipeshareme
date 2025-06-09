import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuth } from './useAuth';

export const useFirebaseAuth = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const signup = async (email, password, displayName) => {
    setError(null);
    setIsPending(true);

    try {
      // Create user with email and password
      const res = await createUserWithEmailAndPassword(auth, email, password);

      if (!res) {
        throw new Error('Could not complete signup');
      }

      // Update profile with display name
      await updateProfile(res.user, { displayName });

      // Create a user document in Firestore
      await setDoc(doc(db, 'users', res.user.uid), {
        displayName,
        email,
        createdAt: serverTimestamp(),
        photoURL: res.user.photoURL || null,
        recipes: [],
        favorites: [],
      });

      // Dispatch login action
      dispatch({ type: 'LOGIN', payload: res.user });

      setIsPending(false);
      navigate('/dashboard');
      return res.user;
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setIsPending(false);
      return null;
    }
  };

  const login = async (email, password) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      dispatch({ type: 'LOGIN', payload: res.user });
      setIsPending(false);
      navigate('/dashboard');
      return res.user;
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setIsPending(false);
      return null;
    }
  };

  const googleSignIn = async () => {
    setError(null);
    setIsPending(true);

    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);

      // Check if this is a new user
      const userDocRef = doc(db, 'users', res.user.uid);
      await setDoc(userDocRef, {
        displayName: res.user.displayName,
        email: res.user.email,
        photoURL: res.user.photoURL,
        createdAt: serverTimestamp(),
        recipes: [],
        favorites: [],
      }, { merge: true });

      dispatch({ type: 'LOGIN', payload: res.user });
      setIsPending(false);
      navigate('/dashboard');
      return res.user;
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setIsPending(false);
      return null;
    }
  };

  const logout = async () => {
    setError(null);
    setIsPending(true);

    try {
      await signOut(auth);
      dispatch({ type: 'LOGOUT' });
      setIsPending(false);
      navigate('/');
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setIsPending(false);
    }
  };

  const resetPassword = async (email) => {
    setError(null);
    setIsPending(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsPending(false);
      return true;
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setIsPending(false);
      return false;
    }
  };

  return { error, isPending, signup, login, googleSignIn, logout, resetPassword };
};