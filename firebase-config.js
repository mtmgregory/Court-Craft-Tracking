// Firebase Configuration - Plain JavaScript (NO BABEL)
// This file loads faster as regular JS

(function() {
  'use strict';
  
  console.log('Loading Firebase config...');
  
  const firebaseConfig = {
    apiKey: "AIzaSyCo4LGQwjvhx5ZZIOrNRAV7n09lJBwHP6g",
    authDomain: "court-craft-tracking.firebaseapp.com",
    projectId: "court-craft-tracking",
    storageBucket: "court-craft-tracking.firebasestorage.app",
    messagingSenderId: "981347011070",
    appId: "1:981347011070:web:be66257a92e5fd669e18af",
    measurementId: "G-18PTJ399N2"
  };

  // Wait for Firebase to be available
  function initFirebase() {
    if (typeof firebase === 'undefined') {
      console.log('Waiting for Firebase SDK...');
      setTimeout(initFirebase, 50);
      return;
    }
    
    try {
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      
      // Initialize Firestore with settings for better performance
      const db = firebase.firestore();
      
      // Enable offline persistence for faster loads
      db.enablePersistence({ synchronizeTabs: true })
        .catch(function(err) {
          if (err.code === 'failed-precondition') {
            console.warn('Persistence failed: Multiple tabs open');
          } else if (err.code === 'unimplemented') {
            console.warn('Persistence not available in this browser');
          }
        });
      
      // Export for use in app
      window.db = db;
      window.firebase = firebase;
      
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
    }
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
  } else {
    initFirebase();
  }
})();