// ========================================
// AUTHENTICATION SERVICE - FIXED VERSION
// Resolves player registration issues
// ========================================

(function() {
  'use strict';
  
  console.log('Loading Fixed Authentication Service...');

  const authService = {
    currentUser: null,
    currentUserData: null,

    // ========================================
    // INITIALIZATION
    // ========================================
    initialize: async function() {
      if (!window.firebase) {
        throw new Error('Firebase not initialized');
      }

      return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged(async (user) => {
          if (user) {
            console.log('User authenticated:', user.email);
            this.currentUser = user;
            
            // Try to load user data with retry logic
            try {
              await this.loadUserData(user.uid);
              resolve(user);
            } catch (error) {
              console.error('Failed to load user data:', error);
              // Don't sign out - user document might be creating
              // Just wait a bit and try again
              setTimeout(async () => {
                try {
                  await this.loadUserData(user.uid);
                  resolve(user);
                } catch (retryError) {
                  console.error('Retry failed:', retryError);
                  await firebase.auth().signOut();
                  this.currentUser = null;
                  this.currentUserData = null;
                  resolve(null);
                }
              }, 1000);
            }
          } else {
            console.log('No user authenticated');
            this.currentUser = null;
            this.currentUserData = null;
            resolve(null);
          }
        });
      });
    },

    // ========================================
    // USER DATA MANAGEMENT
    // ========================================
    loadUserData: async function(uid) {
      try {
        const db = window.db;
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (userDoc.exists) {
          this.currentUserData = {
            uid,
            ...userDoc.data()
          };
          
          // Update last login
          await db.collection('users').doc(uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          console.log('✅ User data loaded:', this.currentUserData.role);
          return this.currentUserData;
        } else {
          console.error('❌ User document not found in Firestore');
          throw new Error('Your account is incomplete. Please try registering again.');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        throw error;
      }
    },

    // ========================================
    // IMPROVED REGISTRATION METHOD
    // ========================================
    register: async function(email, password, userData) {
      console.log('🔵 Starting registration process...');
      
      try {
        // === VALIDATION ===
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        if (!userData.role || !['player', 'coach'].includes(userData.role)) {
          throw new Error('Invalid role specified');
        }

        if (userData.role === 'player' && !userData.displayName) {
          throw new Error('Player name is required');
        }

        // === STEP 1: Create Firebase Auth User ===
        console.log('🔵 Step 1: Creating Firebase Auth user...');
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('✅ Auth user created:', user.uid);

        // Update display name
        await user.updateProfile({
          displayName: userData.displayName || userData.email.split('@')[0]
        });
        console.log('✅ Display name updated');

        // === STEP 2: Prepare User Document ===
        const db = window.db;
        const userDocData = {
          uid: user.uid,
          email: email.toLowerCase(),
          role: userData.role,
          displayName: userData.displayName || email.split('@')[0],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };

        // === STEP 3: Handle Player-Specific Registration ===
        if (userData.role === 'player') {
          console.log('🔵 Step 3: Creating player record...');
          
          try {
            // SIMPLIFIED: Just create a new player record
            // Don't try to find existing players - it's causing issues
            const playerData = {
              name: userData.displayName,
              userId: user.uid,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            console.log('📝 Creating player document:', playerData);
            const playerDoc = await db.collection('players').add(playerData);
            userDocData.playerId = playerDoc.id;
            console.log('✅ Player record created:', playerDoc.id);
            
          } catch (playerError) {
            console.error('❌ Error creating player record:', playerError);
            console.error('Error details:', {
              code: playerError.code,
              message: playerError.message,
              stack: playerError.stack
            });
            
            // Clean up auth user
            try {
              await user.delete();
              console.log('🧹 Cleaned up auth user');
            } catch (cleanupError) {
              console.error('Error cleaning up auth user:', cleanupError);
            }
            
            throw new Error('Failed to create player record. Please try again. Details: ' + playerError.message);
          }
        } else {
          // Coach - no playerId
          userDocData.playerId = null;
          userDocData.teamName = userData.teamName || 'Default Team';
        }

        // === STEP 4: Create User Document ===
        console.log('🔵 Step 4: Creating user document...');
        try {
          await db.collection('users').doc(user.uid).set(userDocData);
          console.log('✅ User document created successfully');
        } catch (userDocError) {
          console.error('❌ Error creating user document:', userDocError);
          
          // Clean up - delete player record if created
          if (userData.role === 'player' && userDocData.playerId) {
            try {
              await db.collection('players').doc(userDocData.playerId).delete();
              console.log('🧹 Cleaned up player record');
            } catch (cleanupError) {
              console.error('Error cleaning up player:', cleanupError);
            }
          }
          
          // Clean up auth user
          try {
            await user.delete();
            console.log('🧹 Cleaned up auth user');
          } catch (cleanupError) {
            console.error('Error cleaning up auth user:', cleanupError);
          }
          
          throw new Error('Failed to create user account. Please try again.');
        }

        // === STEP 5: Load user data ===
        console.log('🔵 Step 5: Loading user data...');
        await this.loadUserData(user.uid);
        
        console.log('✅✅✅ Registration complete!');
        return {
          success: true,
          user: this.currentUser,
          userData: this.currentUserData
        };

      } catch (error) {
        console.error('❌❌❌ Registration error:', error);
        
        // Handle specific Firebase errors
        let errorMessage = error.message;
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already registered. Please login instead.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password is too weak';
        }
        
        throw new Error(errorMessage);
      }
    },

    // ========================================
    // LOGIN METHOD (No changes needed)
    // ========================================
    login: async function(email, password) {
      try {
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Try to load user data
        try {
          await this.loadUserData(user.uid);
        } catch (loadError) {
          await firebase.auth().signOut();
          throw new Error('Your account is incomplete. Please register again or contact support.');
        }

        console.log('✅ Login successful:', this.currentUserData.role);
        return {
          success: true,
          user: this.currentUser,
          userData: this.currentUserData
        };

      } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = error.message;
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later';
        }
        
        throw new Error(errorMessage);
      }
    },

    // ========================================
    // OTHER METHODS (unchanged)
    // ========================================
    logout: async function() {
      try {
        await firebase.auth().signOut();
        this.currentUser = null;
        this.currentUserData = null;
        console.log('✅ Logout successful');
        return { success: true };
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },

    resetPassword: async function(email) {
      try {
        if (!email) {
          throw new Error('Email is required');
        }

        await firebase.auth().sendPasswordResetEmail(email);
        console.log('✅ Password reset email sent');
        return { success: true };

      } catch (error) {
        console.error('Password reset error:', error);
        
        let errorMessage = error.message;
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        }
        
        throw new Error(errorMessage);
      }
    },

    // REMOVED: findPlayerByName() - No longer needed with simplified approach

    isAuthenticated: function() {
      return this.currentUser !== null && this.currentUserData !== null;
    },

    isCoach: function() {
      return this.isAuthenticated() && this.currentUserData.role === 'coach';
    },

    isPlayer: function() {
      return this.isAuthenticated() && this.currentUserData.role === 'player';
    },

    getPlayerId: function() {
      if (this.isPlayer()) {
        return this.currentUserData.playerId;
      }
      return null;
    },

    getCurrentUser: function() {
      return {
        firebaseUser: this.currentUser,
        userData: this.currentUserData
      };
    },

    validateEmail: function(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    validatePassword: function(password) {
      if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
      }
      if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one uppercase letter' };
      }
      if (!/[a-z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one lowercase letter' };
      }
      if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one number' };
      }
      return { valid: true };
    }
  };

  // Export to window
  window.authService = authService;
  console.log('✅ Fixed Authentication Service loaded');
})();