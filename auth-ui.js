// ========================================
// AUTHENTICATION UI COMPONENTS
// Login, Register, Password Reset
// ========================================

const { useState } = React;

// ========================================
// LOGIN SCREEN
// ========================================
const LoginScreen = ({ onLogin, onSwitchToRegister, onForgotPassword }) => {
  const [email, setEmail] = useState('@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await window.authService.login(email, password);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement('div', { className: 'auth-container' }, [
    React.createElement('div', { className: 'auth-card', key: 'card' }, [
      // Logo/Title
      React.createElement('div', { className: 'auth-header', key: 'header' }, [
        React.createElement('div', { 
          key: 'icon',
          style: { fontSize: '3rem', marginBottom: '1rem' }
        }, '🏃'),
        React.createElement('h1', { 
          key: 'title',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }
        }, 'Court Craft Tracker'),
        React.createElement('p', {
          key: 'subtitle',
          style: { color: '#6b7280', marginTop: '0.5rem' }
        }, 'Sign in to access your training data')
      ]),

      // Error Message
      error && React.createElement('div', {
        key: 'error',
        className: 'auth-error'
      }, error),

      // Login Form
      React.createElement('form', { 
        onSubmit: handleSubmit,
        className: 'auth-form',
        key: 'form'
      }, [
        React.createElement('div', { key: 'email-group' }, [
          React.createElement('label', { key: 'label' }, 'Email'),
          React.createElement('input', {
            key: 'input',
            type: 'email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            onFocus: (e) => {
              // If field still contains default @gmail.com, select all for easy replacement
              if (e.target.value === '@gmail.com') {
                e.target.select();
              }
            },
            placeholder: 'your.email@gmail.com',
            required: true,
            disabled: isLoading,
            autoComplete: 'email'
          })
        ]),

        React.createElement('div', { key: 'password-group' }, [
          React.createElement('label', { key: 'label' }, 'Password'),
          React.createElement('input', {
            key: 'input',
            type: 'password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: '••••••••',
            required: true,
            disabled: isLoading,
            autoComplete: 'current-password'
          })
        ]),

        React.createElement('button', {
          key: 'submit',
          type: 'submit',
          className: 'btn btn-primary',
          disabled: isLoading,
          style: { marginTop: '0.5rem' }
        }, isLoading ? 'Signing In...' : 'Sign In'),

        React.createElement('button', {
          key: 'forgot',
          type: 'button',
          onClick: onForgotPassword,
          className: 'auth-link',
          disabled: isLoading
        }, 'Forgot Password?')
      ]),

      // Register Link
      React.createElement('div', { 
        className: 'auth-footer',
        key: 'footer'
      }, [
        React.createElement('p', { key: 'text' }, "Don't have an account? "),
        React.createElement('button', {
          key: 'link',
          type: 'button',
          onClick: onSwitchToRegister,
          className: 'auth-link-primary',
          disabled: isLoading
        }, 'Register')
      ])
    ])
  ]);
};

// ========================================
// REGISTER SCREEN
// ========================================
const RegisterScreen = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'player',
    teamName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!window.authService.validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordValidation = window.authService.validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return;
    }

    if (formData.role === 'player' && !formData.displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      await window.authService.register(formData.email, formData.password, {
        role: formData.role,
        displayName: formData.displayName.trim(),
        teamName: formData.teamName.trim() || 'Default Team'
      });
      onRegister();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement('div', { className: 'auth-container' }, [
    React.createElement('div', { className: 'auth-card', key: 'card' }, [
      // Header
      React.createElement('div', { className: 'auth-header', key: 'header' }, [
        React.createElement('div', { 
          key: 'icon',
          style: { fontSize: '3rem', marginBottom: '1rem' }
        }, '🏃'),
        React.createElement('h1', { 
          key: 'title',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }
        }, 'Create Account'),
        React.createElement('p', {
          key: 'subtitle',
          style: { color: '#6b7280', marginTop: '0.5rem' }
        }, 'Join Court Craft Tracker')
      ]),

      // Error Message
      error && React.createElement('div', {
        key: 'error',
        className: 'auth-error'
      }, error),

      // Register Form
      React.createElement('form', { 
        onSubmit: handleSubmit,
        className: 'auth-form',
        key: 'form'
      }, [
        // Role Selection
        React.createElement('div', { key: 'role-group' }, [
          React.createElement('label', { key: 'label' }, 'I am a...'),
          React.createElement('div', { 
            className: 'role-selector',
            key: 'selector'
          }, [
            React.createElement('button', {
              key: 'player',
              type: 'button',
              onClick: () => updateField('role', 'player'),
              className: `role-option ${formData.role === 'player' ? 'active' : ''}`,
              disabled: isLoading
            }, [
              React.createElement('span', { key: 'icon', className: 'role-icon' }, '🏃'),
              React.createElement('span', { key: 'text' }, 'Player')
            ]),
            React.createElement('button', {
              key: 'coach',
              type: 'button',
              onClick: () => updateField('role', 'coach'),
              className: `role-option ${formData.role === 'coach' ? 'active' : ''}`,
              disabled: isLoading
            }, [
              React.createElement('span', { key: 'icon', className: 'role-icon' }, '👨‍🏫'),
              React.createElement('span', { key: 'text' }, 'Coach')
            ])
          ])
        ]),

        // Name Field
        React.createElement('div', { key: 'name-group' }, [
          React.createElement('label', { key: 'label' }, 
            formData.role === 'player' ? 'Your Name' : 'Coach Name'
          ),
          React.createElement('input', {
            key: 'input',
            type: 'text',
            value: formData.displayName,
            onChange: (e) => updateField('displayName', e.target.value),
            placeholder: formData.role === 'player' ? 'John Doe' : 'Coach Smith',
            required: true,
            disabled: isLoading
          })
        ]),

        // Team Name (Coach only)
        formData.role === 'coach' && React.createElement('div', { key: 'team-group' }, [
          React.createElement('label', { key: 'label' }, 'Team Name (Optional)'),
          React.createElement('input', {
            key: 'input',
            type: 'text',
            value: formData.teamName,
            onChange: (e) => updateField('teamName', e.target.value),
            placeholder: 'Hawks Basketball',
            disabled: isLoading
          })
        ]),

        // Email
        React.createElement('div', { key: 'email-group' }, [
          React.createElement('label', { key: 'label' }, 'Email'),
          React.createElement('input', {
            key: 'input',
            type: 'email',
            value: formData.email,
            onChange: (e) => updateField('email', e.target.value),
            placeholder: 'your.email@example.com',
            required: true,
            disabled: isLoading,
            autoComplete: 'email'
          })
        ]),

        // Password
        React.createElement('div', { key: 'password-group' }, [
          React.createElement('label', { key: 'label' }, 'Password'),
          React.createElement('input', {
            key: 'input',
            type: 'password',
            value: formData.password,
            onChange: (e) => updateField('password', e.target.value),
            placeholder: '••••••••',
            required: true,
            disabled: isLoading,
            autoComplete: 'new-password'
          }),
          React.createElement('p', {
            key: 'hint',
            style: { fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }
          }, 'Min 8 characters, 1 uppercase, 1 lowercase, 1 number')
        ]),

        // Confirm Password
        React.createElement('div', { key: 'confirm-group' }, [
          React.createElement('label', { key: 'label' }, 'Confirm Password'),
          React.createElement('input', {
            key: 'input',
            type: 'password',
            value: formData.confirmPassword,
            onChange: (e) => updateField('confirmPassword', e.target.value),
            placeholder: '••••••••',
            required: true,
            disabled: isLoading,
            autoComplete: 'new-password'
          })
        ]),

        // Submit
        React.createElement('button', {
          key: 'submit',
          type: 'submit',
          className: 'btn btn-primary',
          disabled: isLoading,
          style: { marginTop: '0.5rem' }
        }, isLoading ? 'Creating Account...' : 'Create Account')
      ]),

      // Login Link
      React.createElement('div', { 
        className: 'auth-footer',
        key: 'footer'
      }, [
        React.createElement('p', { key: 'text' }, 'Already have an account? '),
        React.createElement('button', {
          key: 'link',
          type: 'button',
          onClick: onSwitchToLogin,
          className: 'auth-link-primary',
          disabled: isLoading
        }, 'Sign In')
      ])
    ])
  ]);
};

// ========================================
// FORGOT PASSWORD SCREEN
// ========================================
const ForgotPasswordScreen = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await window.authService.resetPassword(email);
      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement('div', { className: 'auth-container' }, [
    React.createElement('div', { className: 'auth-card', key: 'card' }, [
      // Header
      React.createElement('div', { className: 'auth-header', key: 'header' }, [
        React.createElement('div', { 
          key: 'icon',
          style: { fontSize: '3rem', marginBottom: '1rem' }
        }, '🔐'),
        React.createElement('h1', { 
          key: 'title',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }
        }, 'Reset Password'),
        React.createElement('p', {
          key: 'subtitle',
          style: { color: '#6b7280', marginTop: '0.5rem' }
        }, 'Enter your email to receive reset instructions')
      ]),

      // Success Message
      success && React.createElement('div', {
        key: 'success',
        className: 'auth-success'
      }, '✅ Password reset email sent! Check your inbox. Redirecting...'),

      // Error Message
      error && React.createElement('div', {
        key: 'error',
        className: 'auth-error'
      }, error),

      // Form
      !success && React.createElement('form', { 
        onSubmit: handleSubmit,
        className: 'auth-form',
        key: 'form'
      }, [
        React.createElement('div', { key: 'email-group' }, [
          React.createElement('label', { key: 'label' }, 'Email'),
          React.createElement('input', {
            key: 'input',
            type: 'email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: 'your.email@example.com',
            required: true,
            disabled: isLoading,
            autoComplete: 'email'
          })
        ]),

        React.createElement('button', {
          key: 'submit',
          type: 'submit',
          className: 'btn btn-primary',
          disabled: isLoading,
          style: { marginTop: '0.5rem' }
        }, isLoading ? 'Sending...' : 'Send Reset Email'),

        React.createElement('button', {
          key: 'back',
          type: 'button',
          onClick: onBack,
          className: 'auth-link',
          disabled: isLoading
        }, '← Back to Sign In')
      ])
    ])
  ]);
};

// ========================================
// AUTH WRAPPER - Main Component
// ========================================
const AuthWrapper = ({ children }) => {
  const [authState, setAuthState] = useState('loading'); // loading, login, register, forgot
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
  try {
    await window.authService.initialize();
    if (window.authService.isAuthenticated()) {
      setIsAuthenticated(true);
      setAuthState('authenticated');  // ← ADD THIS LINE
    } else {
      setAuthState('login');
    }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState('login');
    }
  };

  const handleLogin = () => {
  setIsAuthenticated(true);
  setAuthState('authenticated');  // ← CHANGE: Set state instead of reload
};

const handleRegister = () => {
  setIsAuthenticated(true);
  setAuthState('authenticated');  // ← CHANGE: Set state instead of reload
};

  // Loading state
  if (authState === 'loading') {
    return React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }
    }, [
      React.createElement('div', { className: 'loading-spinner', key: 'spinner' }),
      React.createElement('p', {
        key: 'text',
        style: { color: '#6b7280' }
      }, 'Checking authentication...')
    ]);
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    if (authState === 'login') {
      return React.createElement(LoginScreen, {
        onLogin: handleLogin,
        onSwitchToRegister: () => setAuthState('register'),
        onForgotPassword: () => setAuthState('forgot')
      });
    } else if (authState === 'register') {
      return React.createElement(RegisterScreen, {
        onRegister: handleRegister,
        onSwitchToLogin: () => setAuthState('login')
      });
    } else if (authState === 'forgot') {
      return React.createElement(ForgotPasswordScreen, {
        onBack: () => setAuthState('login')
      });
    }
  }

  // Show app if authenticated
  return children;
};

// Export components
window.AuthComponents = {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  AuthWrapper
};

console.log('✅ Auth UI Components loaded');