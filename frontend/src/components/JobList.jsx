import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🔍' },
  { id: 'construction', label: 'Construction', icon: '🏗️' },
  { id: 'it_tech', label: 'IT / Tech', icon: '💻' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'finance', label: 'Finance', icon: '📊' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { id: 'delivery', label: 'Delivery', icon: '🚚' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'hospitality', label: 'Hospitality', icon: '🏨' },
  { id: 'marketing', label: 'Marketing', icon: '📱' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'logistics', label: 'Logistics', icon: '📦' },
  { id: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { id: 'domestic', label: 'Domestic', icon: '🏠' }
];

const CAT_LABELS = {
  construction:'Construction', it_tech:'IT/Tech', healthcare:'Healthcare', finance:'Finance', education:'Education', cleaning:'Cleaning', delivery:'Delivery', security:'Security', hospitality:'Hospitality', marketing:'Marketing', design:'Design', logistics:'Logistics', agriculture:'Agriculture', domestic:'Domestic', manufacturing:'Manufacturing', legal:'Legal', engineering:'Engineering', other:'Other'
};

const EXP_LABELS = {
  fresher: 'Fresher OK', less_than_1: '<1 yr exp', '1_to_3': '1–3 yrs', '3_to_5': '3–5 yrs', '5_plus': '5+ yrs', none: 'No exp'
};

export default function JobList({ setActiveTab }) {
  const {
    jobs,
    loading,
    activeFilter,
    setActiveFilter,
    sortMode,
    setSortMode,
    searchQuery,
    setSearchQuery,
    setSelectedJob,
    setShowApplyModalForJob
  } = useJobs();
  const { appliedJobs } = useAuth();

  const handleSortToggle = () => {
    const modes = ['latest', 'pay', 'nearby'];
    const idx = (modes.indexOf(sortMode) + 1) % 3;
    setSortMode(modes[idx]);
  };

  const getSortLabel = () => {
    const labels = { latest: 'Latest', pay: 'Highest Pay', nearby: 'Nearest' };
    return labels[sortMode] || 'Latest';
  };

  // Filter & Sort logic
  const query = searchQuery.toLowerCase();
  const filtered = jobs.filter(j =>
    (activeFilter === 'all' || j.cat === activeFilter) &&
    (!query || j.title.toLowerCase().includes(query) || j.employer.toLowerCase().includes(query) ||
     j.loc.toLowerCase().includes(query) || (j.skills && j.skills.join(' ').toLowerCase().includes(query)))
  );

  const sorted = [...filtered];
  if (sortMode === 'pay') {
    sorted.sort((a, b) => b.pay - a.pay);
  } else if (sortMode === 'nearby') {
    sorted.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
  } else {
    // latest / urgent first
    sorted.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  }

  return (
    <div id="panel-find" class="active">
      <div class="hero">
        <div class="hero-badge">📍 Near You in Bhubaneswar</div>
        <h1>Find <span>Daily Work</span><br/>Near You – Fast</h1>
        <p>No resume needed. Just your skill and willingness. Employers are waiting.</p>
        <div class="hero-actions">
          <button class="btn-primary" onClick={() => setActiveTab('post')}>📋 Post a Job</button>
          <button class="btn-outline" onClick={() => document.getElementById('search-input')?.focus()}>🔍 Search Jobs</button>
        </div>
      </div>

      <div class="stats">
        <div class="stat"><div class="stat-num">{jobs.length}</div><div class="stat-lbl">Active Jobs</div></div>
        <div class="stat"><div class="stat-num">1,420</div><div class="stat-lbl">Workers Hired</div></div>
        <div class="stat"><div class="stat-num">312</div><div class="stat-lbl">Employers</div></div>
        <div class="stat"><div class="stat-num">⚡ 2hrs</div><div class="stat-lbl">Avg. Hire Time</div></div>
      </div>

      <div class="search-bar">
        <span>🔍</span>
        <input
          class="search-input"
          id="search-input"
          placeholder="Search – construction, IT, healthcare, delivery…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div class="search-loc">📍 <span>Bhubaneswar</span></div>
        <button class="btn-search" type="button">Search</button>
      </div>

      <div class="filter-row">
        <span class="filter-label">Category:</span>
        {CATEGORIES.map(c => (
          <div
            key={c.id}
            class={`chip ${activeFilter === c.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(c.id)}
          >
            {c.icon} {c.label}
          </div>
        ))}
      </div>

      <div class="section-title">
        <span>📌 Jobs Near You <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: "'Noto Sans', sans-serif" }}>({sorted.length})</span></span>
        <a onClick={handleSortToggle} style={{ cursor: 'pointer' }}>Sort by: <span>{getSortLabel()}</span> ▾</a>
      </div>

      {loading ? (
        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
          <div class="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px', borderWidth: '3px' }}></div>
          <div>Loading jobs…</div>
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '1.1rem' }}>No jobs found</div>
          <div style={{ fontSize: '0.83rem', marginTop: '6px' }}>Try a different category or search term</div>
        </div>
      ) : (
        <div class="jobs-grid">
          {sorted.map(j => {
            const isFilled = j.hired >= j.workers;
            const isApplied = appliedJobs.has(j.id);
            const catLabel = CAT_LABELS[j.cat] || j.cat;
            return (
              <div key={j.id} class="job-card" onClick={() => setSelectedJob(j)}>
                <div class="job-top">
                  <div class={`job-icon ${j.urgent ? 'job-urgent' : 'job-norm'}`}>{j.icon}</div>
                  <div class="job-badges">
                    {j.urgent && <div class="badge badge-urgent">🔴 URGENT</div>}
                    {!isFilled && !j.urgent && <div class="badge badge-new">NEW</div>}
                    {isFilled && <div class="badge badge-filled">FILLED</div>}
                    <div class="badge badge-cat">{catLabel}</div>
                  </div>
                </div>
                <div class="job-title">{j.title}</div>
                <div class="job-employer">👤 {j.employer}</div>
                <div class="job-meta">
                  <div class="job-meta-item">📍 {j.loc} · {j.dist}</div>
                  <div class="job-meta-item">⏱ {j.dur}</div>
                  <div class="job-meta-item">👥 {j.workers - j.hired} spots left</div>
                  {j.expRequired && j.expRequired !== 'none' && (
                    <div class="job-meta-item">🎯 {EXP_LABELS[j.expRequired] || j.expRequired}</div>
                  )}
                </div>
                <div class="job-pay">
                  ₹{j.pay.toLocaleString()}
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>/day</span>
                </div>
                <div class="job-footer">
                  <div class="job-time">🕐 {j.time}</div>
                  <button
                    type="button"
                    class={`btn-apply ${isApplied ? 'applied' : isFilled ? 'filled' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isFilled && !isApplied) {
                        setShowApplyModalForJob(j);
                      }
                    }}
                    disabled={isFilled}
                  >
                    {isApplied ? '✅ Applied' : isFilled ? 'Filled' : '⚡ Apply Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
