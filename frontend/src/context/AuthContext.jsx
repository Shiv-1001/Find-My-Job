import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchApplications = async (token = authToken) => {
    try {
      const res = await api.getApplications(token || authToken);
      if (res.success) {
        setMyApplications(res.applications);
        const jobIds = new Set(res.applications.map(app => app.job?._id).filter(Boolean));
        setAppliedJobs(jobIds);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  // Initialize
  useEffect(() => {
    const savedToken = localStorage.getItem('kd_token');
    const savedUser = localStorage.getItem('kd_user');
    if (savedToken && savedUser) {
      setAuthToken(savedToken);
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      if (!savedToken.startsWith('demo') && !savedToken.startsWith('offline')) {
        fetchApplications(savedToken);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setAuthToken(res.token);
        setCurrentUser(res.user);
        localStorage.setItem('kd_token', res.token);
        localStorage.setItem('kd_user', JSON.stringify(res.user));
        fetchApplications(res.token);
      }
      return res;
    } catch (err) {
      // Offline fallback check
      if (email && password === 'demo123') {
        const demoUser = offlineLogin(email.includes('employer') ? 'employer' : 'worker', email);
        return { success: true, message: 'Logged in (demo mode)', user: demoUser };
      }
      return { success: false, message: 'Server connection error. Try demo login.' };
    }
  };

  const offlineLogin = (role, email) => {
    const demoUser = {
      id: 'demo_' + Date.now(),
      name: role === 'employer' ? 'Demo Employer' : 'Demo Worker',
      email: email,
      phone: '9876543210',
      role: role,
      address: { area: 'Saheed Nagar', city: 'Bhubaneswar' },
      skills: ['Heavy Lifting', 'Basic Tools'],
      experience: '1_to_3',
      totalJobsDone: 0,
      rating: 4.8
    };
    const token = 'demo_token';
    setAuthToken(token);
    setCurrentUser(demoUser);
    localStorage.setItem('kd_token', token);
    localStorage.setItem('kd_user', JSON.stringify(demoUser));
    return demoUser;
  };

  const demoLogin = (role) => {
    offlineLogin(role, role + '@demo.com');
  };

  const register = async (payload) => {
    try {
      const res = await api.register(payload);
      if (res.success) {
        setAuthToken(res.token);
        setCurrentUser(res.user);
        localStorage.setItem('kd_token', res.token);
        localStorage.setItem('kd_user', JSON.stringify(res.user));
      }
      return res;
    } catch (err) {
      // Offline register fallback
      const offlineUser = {
        id: 'demo_' + Date.now(),
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        role: payload.role,
        address: payload.address,
        experience: payload.experience || 'fresher',
        skills: [],
        totalJobsDone: 0,
        rating: 4.8
      };
      const token = 'offline_token';
      setAuthToken(token);
      setCurrentUser(offlineUser);
      localStorage.setItem('kd_token', token);
      localStorage.setItem('kd_user', JSON.stringify(offlineUser));
      return { success: true, message: 'Account created in offline mode!', user: offlineUser };
    }
  };

  const logout = () => {
    localStorage.removeItem('kd_token');
    localStorage.removeItem('kd_user');
    setCurrentUser(null);
    setAuthToken(null);
    setAppliedJobs(new Set());
    setMyApplications([]);
  };

  const updateProfile = async (updates) => {
    try {
      const res = await api.updateProfile(authToken, updates);
      if (res.success) {
        const updated = { ...currentUser, ...updates };
        setCurrentUser(updated);
        localStorage.setItem('kd_user', JSON.stringify(updated));
      }
      return res;
    } catch (err) {
      // Offline profile update
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      localStorage.setItem('kd_user', JSON.stringify(updated));
      return { success: true, message: 'Profile updated in offline mode' };
    }
  };

  const addAppliedJob = (jobId, jobDetails = null) => {
    setAppliedJobs(prev => {
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });
    // Refresh applications after applying
    if (authToken && !authToken.startsWith('demo') && !authToken.startsWith('offline')) {
      fetchApplications();
    } else {
      // Mock local update in offline mode
      setMyApplications(prev => [
        {
          _id: 'mock_app_' + Date.now(),
          job: jobDetails || { _id: jobId },
          status: 'pending',
          appliedAt: new Date()
        },
        ...prev
      ]);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      authToken,
      appliedJobs,
      myApplications,
      loading,
      toast,
      showToast,
      login,
      demoLogin,
      register,
      logout,
      updateProfile,
      addAppliedJob,
      fetchApplications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
