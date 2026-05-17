import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import Auth from './components/Auth';
import Header from './components/Header';
import JobList from './components/JobList';
import PostJob from './components/PostJob';
import ProfilePanel from './components/ProfilePanel';
import JobModal from './components/JobModal';
import ApplyModal from './components/ApplyModal';

function MainAppContent() {
  const { currentUser, loading, toast } = useAuth();
  const [activeTab, setActiveTab] = useState('find'); // 'find', 'post', 'profile'

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text)', gap: '16px' }}>
        <div class="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        <div style={{ fontFamily: "'Baloo 2', cursive" }}>Loading Find My Job…</div>
      </div>
    );
  }

  return (
    <>
      {!currentUser ? (
        <Auth />
      ) : (
        <div id="app-screen" style={{ display: 'block' }}>
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main>
            {activeTab === 'find' && <JobList setActiveTab={setActiveTab} />}
            {activeTab === 'post' && <PostJob setActiveTab={setActiveTab} />}
            {activeTab === 'profile' && <ProfilePanel />}
          </main>

          {/* Modals */}
          <JobModal />
          <ApplyModal />
        </div>
      )}

      {/* Global Toast */}
      {toast && (
        <div class={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '⚠️'} {toast.message}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <MainAppContent />
      </JobProvider>
    </AuthProvider>
  );
}
