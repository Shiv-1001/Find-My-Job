import { useAuth } from '../context/AuthContext';

export default function Header({ activeTab, setActiveTab }) {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'User';
  const roleAvatar = currentUser.role === 'employer' ? '🏢' : '👷';

  return (
    <header>
      <div class="logo" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('find')}>
        <div class="logo-icon">🏗️</div>
        <div class="logo-text">Find My <span>Job</span></div>
      </div>
      <nav>
        <button
          class={activeTab === 'find' ? 'active' : ''}
          onClick={() => setActiveTab('find')}
        >
          <span>🔍 Find Jobs</span>
        </button>
        <button
          class={activeTab === 'post' ? 'active' : ''}
          onClick={() => setActiveTab('post')}
        >
          <span>📋 Post Job</span>
        </button>
        <button
          class={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          <span>👤 Profile</span>
        </button>
      </nav>
      <div class="header-right">
        <div class="user-badge" onClick={() => setActiveTab('profile')}>
          <div class="user-avatar">{roleAvatar}</div>
          <span>{firstName}</span>
        </div>
        <button class="btn-logout" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
