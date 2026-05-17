import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

const EXP_LABELS = {
  fresher: 'Fresher OK', less_than_1: '<1 yr exp', '1_to_3': '1–3 yrs', '3_to_5': '3–5 yrs', '5_plus': '5+ yrs', none: 'No exp'
};

export default function JobModal() {
  const { selectedJob, setSelectedJob, setShowApplyModalForJob } = useJobs();
  const { appliedJobs, showToast } = useAuth();

  if (!selectedJob) return null;

  const j = selectedJob;
  const isFilled = j.hired >= j.workers;
  const isApplied = appliedJobs.has(j.id);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setSelectedJob(null);
    }
  };

  return (
    <div class="modal-overlay" onClick={handleOverlayClick}>
      <div class="modal">
        <button class="modal-close" onClick={() => setSelectedJob(null)}>✕</button>
        <div id="modal-content">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{j.icon}</div>
          <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '1.4rem' }}>{j.title}</h2>
          <div style={{ color: 'var(--subtext)', fontSize: '0.85rem', marginBottom: '4px' }}>👤 {j.employer}</div>
          <div class="modal-pay">
            ₹{j.pay.toLocaleString()}
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>/day</span>
          </div>
          <div class="modal-meta">
            <div class="modal-meta-item">📍 {j.loc} · {j.dist}</div>
            <div class="modal-meta-item">⏱ {j.dur}</div>
            <div class="modal-meta-item">👥 {j.workers} needed · {j.hired} hired</div>
            <div class="modal-meta-item">📞 {j.phone}</div>
            {j.expRequired && j.expRequired !== 'none' && (
              <div class="modal-meta-item">🎯 {EXP_LABELS[j.expRequired] || j.expRequired}</div>
            )}
          </div>

          {j.skills && j.skills.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '8px' }}>Skills required:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {j.skills.map((s, idx) => (
                  <span key={idx} class="skill-tag selected">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div class="modal-desc">{j.desc}</div>
          <div class="modal-actions">
            <button
              class="btn-call"
              onClick={() => {
                showToast(`Simulating call to ${j.phone}…`, 'success');
              }}
            >
              📞 {j.phone}
            </button>
            <button
              class={`btn-primary btn-modal ${isApplied ? 'applied' : isFilled ? 'filled' : ''}`}
              onClick={() => {
                if (!isApplied && !isFilled) {
                  setSelectedJob(null);
                  setShowApplyModalForJob(j);
                }
              }}
              disabled={isFilled}
              style={{ flex: 1 }}
            >
              {isApplied ? '✅ Already Applied' : isFilled ? 'Position Filled' : '⚡ Apply Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
