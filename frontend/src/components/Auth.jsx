import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const { login, register, demoLogin } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('worker'); // 'worker' or 'employer'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regArea, setRegArea] = useState('');
  const [regCity, setRegCity] = useState('Bhubaneswar');
  const [regExperience, setRegExperience] = useState('fresher');
  const [regJobtitle, setRegJobtitle] = useState('');
  const [regCompany, setRegCompany] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!loginEmail || !loginPassword) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        setSuccess('Logged in successfully!');
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError('Cannot connect to server. Use demo login or start the backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!regName || !regPhone || !regEmail || !regPassword) {
      setError('Please fill all required fields.');
      return;
    }
    if (regPhone.length !== 10 || !/^\d+$/.test(regPhone)) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Passwords do not match.');
      return;
    }

    const payload = {
      name: regName,
      phone: regPhone,
      email: regEmail,
      password: regPassword,
      role,
      address: { area: regArea, city: regCity },
      experience: role === 'worker' ? regExperience : 'fresher',
      currentJobTitle: role === 'worker' ? regJobtitle : '',
      companyName: role === 'employer' ? regCompany : ''
    };

    setLoading(true);
    try {
      const res = await register(payload);
      if (res.success) {
        setSuccess(res.message || 'Account created successfully!');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Cannot connect to server. Offline mode account created.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen">
      <div class="auth-container">
        <div class="auth-logo">
          <div class="auth-logo-icon">🏗️</div>
          <div class="auth-logo-text">Find My <span>Job</span></div>
          <p>Find daily work near you – fast &amp; free</p>
        </div>
        <div class="auth-card">
          <div class="auth-tabs">
            <button
              class={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); clearMessages(); }}
            >
              Login
            </button>
            <button
              class={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); clearMessages(); }}
            >
              Register
            </button>
          </div>

          {error && <div class="auth-error" style={{ display: 'block' }}>⚠️ {error}</div>}
          {success && <div class="auth-success" style={{ display: 'block' }}>✅ {success}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} id="login-form">
              <div class="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div class="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <button type="submit" class="btn-auth" disabled={loading}>
                {loading ? (
                  <>
                    <span class="spinner"></span> Logging in…
                  </>
                ) : (
                  'Login to Find My Job'
                )}
              </button>
              <div class="auth-divider">— or use demo accounts —</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  class="btn-outline"
                  style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}
                  onClick={() => demoLogin('worker')}
                >
                  👷 Demo Worker
                </button>
                <button
                  type="button"
                  class="btn-outline"
                  style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}
                  onClick={() => demoLogin('employer')}
                >
                  🏢 Demo Employer
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} id="register-form">
              <div style={{ marginBottom: '16px' }}>
                <div class="apply-form-section-title" style={{ marginBottom: '10px' }}>👤 I want to…</div>
                <div class="role-select">
                  <div
                    class={`role-option ${role === 'worker' ? 'selected' : ''}`}
                    onClick={() => setRole('worker')}
                  >
                    <div class="role-icon">👷</div>
                    <div class="role-label">Find Work</div>
                    <div class="role-sub">Job seeker / Worker</div>
                  </div>
                  <div
                    class={`role-option ${role === 'employer' ? 'selected' : ''}`}
                    onClick={() => setRole('employer')}
                  >
                    <div class="role-icon">🏢</div>
                    <div class="role-label">Hire Workers</div>
                    <div class="role-sub">Employer / Company</div>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Ramesh Kumar"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div class="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Area / Locality</label>
                  <input
                    type="text"
                    placeholder="Saheed Nagar"
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                  />
                </div>
                <div class="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="Bhubaneswar"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                  />
                </div>
              </div>

              {role === 'worker' ? (
                <div id="worker-fields">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Experience Level</label>
                      <select
                        value={regExperience}
                        onChange={(e) => setRegExperience(e.target.value)}
                      >
                        <option value="fresher">Fresher (No experience)</option>
                        <option value="less_than_1">Less than 1 year</option>
                        <option value="1_to_3">1–3 years</option>
                        <option value="3_to_5">3–5 years</option>
                        <option value="5_plus">5+ years</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Current / Last Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Construction Helper"
                        value={regJobtitle}
                        onChange={(e) => setRegJobtitle(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div id="employer-fields">
                  <div class="form-group">
                    <label>Company / Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Patel Builders Pvt Ltd"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button type="submit" class="btn-auth" disabled={loading}>
                {loading ? (
                  <>
                    <span class="spinner"></span> Creating account…
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
