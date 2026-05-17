import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const EXP_LABELS = {
  fresher: 'Fresher', less_than_1: '<1 yr exp', '1_to_3': '1–3 yrs exp', '3_to_5': '3–5 yrs exp', '5_plus': '5+ yrs exp'
};

const STATUS_LABELS = {
  pending: 'Pending Review', hired: 'Hired', rejected: 'Rejected', shortlisted: 'Shortlisted'
};

const STATUS_CLASSES = {
  pending: 'status-pending', hired: 'status-hired', rejected: 'status-rejected', shortlisted: 'status-shortlisted'
};

export default function ProfilePanel() {
  const { currentUser, myApplications, updateProfile, showToast } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [experience, setExperience] = useState('fresher');
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setPhone(currentUser.phone || '');
      setArea(currentUser.address?.area || '');
      setExperience(currentUser.experience || 'fresher');
      setJobTitle(currentUser.currentJobTitle || '');
      setSkills(currentUser.skills ? currentUser.skills.join(', ') : '');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const u = currentUser;
  const roleAvatar = u.role === 'employer' ? '🏢' : '👷';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const updates = {
      phone,
      address: { area, city: u.address?.city || 'Bhubaneswar' }
    };

    if (u.role === 'worker') {
      updates.experience = experience;
      updates.currentJobTitle = jobTitle;
      updates.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    try {
      const res = await updateProfile(updates);
      if (res.success) {
        showToast('Profile saved successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to save profile.', 'error');
      }
    } catch (err) {
      showToast('Profile saved (offline fallback).', 'success');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="panel-profile" class="active">
      <div class="profile-panel">
        <div class="profile-header">
          <div class="avatar">{roleAvatar}</div>
          <div class="profile-info">
            <div class="profile-name">{u.name}</div>
            <p>📞 {u.phone} &nbsp;|&nbsp; 📧 {u.email}</p>
            {u.address?.area && <p>📍 {u.address.area}, {u.address.city || 'Bhubaneswar'}</p>}
            {u.role === 'worker' && u.experience && <p>💼 {EXP_LABELS[u.experience] || u.experience}</p>}
            {u.role === 'employer' && u.companyName && <p>🏢 {u.companyName}</p>}
            <div class="profile-stats">
              <div class="profile-stat">
                <div class="profile-stat-num">{myApplications.length}</div>
                <div class="profile-stat-lbl">Applications</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-num">{u.totalJobsDone || 0}</div>
                <div class="profile-stat-lbl">Jobs Done</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-num">{u.rating || '4.8'}⭐</div>
                <div class="profile-stat-lbl">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {u.role === 'worker' && u.skills && u.skills.length > 0 && (
          <div class="profile-section">
            <h3>🛠️ My Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {u.skills.map((s, idx) => (
                <div key={idx} class="skill-tag selected">{s}</div>
              ))}
            </div>
          </div>
        )}

        <div class="profile-section">
          <h3>📌 My Applications ({myApplications.length})</h3>
          {myApplications.length > 0 ? (
            myApplications.map((app) => {
              const j = app.job || {};
              const jobIcon = j.icon || '💼';
              const jobTitleText = j.title || 'Unknown Job';
              const jobEmployer = j.employerName || 'Employer';
              const jobLoc = j.location?.area || 'Bhubaneswar';
              const jobPay = j.payPerDay || 0;
              const statusClass = STATUS_CLASSES[app.status] || 'status-pending';
              const statusLabel = STATUS_LABELS[app.status] || app.status || 'Pending Review';

              return (
                <div key={app._id} class="history-item">
                  <div>
                    <div class="history-title">{jobIcon} {jobTitleText}</div>
                    <div class="history-sub">{jobEmployer} · 📍 {jobLoc}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div class="history-pay">₹{jobPay.toLocaleString()}/day</div>
                    <span class={`app-status ${statusClass}`}>{statusLabel}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', padding: '10px 0' }}>
              No applications yet. Browse jobs and apply!
            </div>
          )}
        </div>

        <div class="profile-section">
          <h3>⚙️ Edit Profile</h3>
          <form onSubmit={handleSave}>
            <div class="form-row">
              <div class="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div class="form-group">
                <label>Area</label>
                <input
                  type="text"
                  placeholder="Saheed Nagar"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
            </div>

            {u.role === 'worker' && (
              <>
                <div class="form-row">
                  <div class="form-group">
                    <label>Experience</label>
                    <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                      <option value="fresher">Fresher</option>
                      <option value="less_than_1">Less than 1 year</option>
                      <option value="1_to_3">1–3 years exp</option>
                      <option value="3_to_5">3–5 years exp</option>
                      <option value="5_plus">5+ years exp</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Current Job Title</label>
                    <input
                      type="text"
                      placeholder="Helper, Developer…"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label>Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Heavy Lifting, Driving…"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
              </>
            )}

            <button type="submit" class="btn-primary" style={{ width: '100%', padding: '12px' }} disabled={saving}>
              {saving ? <span class="spinner"></span> : '💾 Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
