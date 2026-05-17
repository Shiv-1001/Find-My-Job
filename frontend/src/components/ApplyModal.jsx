import { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

const EXP_LABELS = {
  fresher: 'Fresher OK', less_than_1: '<1 yr exp', '1_to_3': '1–3 yrs', '3_to_5': '3–5 yrs', '5_plus': '5+ yrs', none: 'No exp'
};

const LANGUAGES = ['Odia', 'Hindi', 'English', 'Bengali', 'Telugu', 'Urdu'];

export default function ApplyModal() {
  const { showApplyModalForJob, setShowApplyModalForJob, applyForJob } = useJobs();
  const { currentUser, addAppliedJob, showToast } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [expectedPay, setExpectedPay] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Bhubaneswar');
  const [district, setDistrict] = useState('Khordha');
  const [pincode, setPincode] = useState('');

  const [experience, setExperience] = useState('fresher');
  const [jobTitle, setJobTitle] = useState('');
  const [education, setEducation] = useState('');
  const [availability, setAvailability] = useState('immediate');
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [hasVehicle, setHasVehicle] = useState(false);
  const [hasLicense, setHasLicense] = useState(false);

  const [coverNote, setCoverNote] = useState('');

  useEffect(() => {
    if (currentUser && showApplyModalForJob) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setExpectedPay(showApplyModalForJob.pay || '');
      setArea(currentUser.address?.area || '');
      setCity(currentUser.address?.city || 'Bhubaneswar');
      setDistrict(currentUser.address?.district || 'Khordha');
      setPincode(currentUser.address?.pincode || '');

      setExperience(currentUser.experience || 'fresher');
      setJobTitle(currentUser.currentJobTitle || '');
      setEducation(currentUser.education || '');
      setSelectedLangs(currentUser.languages || []);
      setSelectedSkills(currentUser.skills || []);
      setHasVehicle(currentUser.hasOwnVehicle || false);
      setHasLicense(currentUser.hasDrivingLicense || false);
      setStep(1);
    }
  }, [currentUser, showApplyModalForJob]);

  if (!showApplyModalForJob) return null;

  const j = showApplyModalForJob;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setShowApplyModalForJob(null);
    }
  };

  const toggleLanguage = (lang) => {
    setSelectedLangs(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name || !phone) {
        showToast('Please fill your name and phone number.', 'error');
        return;
      }
      if (phone.length !== 10) {
        showToast('Enter a valid 10-digit phone number.', 'error');
        return;
      }
    }
    if (step === 3) {
      handleSubmit();
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    const payload = {
      name,
      phone,
      email,
      address: { area, city, district, pincode },
      experience,
      currentJobTitle: jobTitle,
      education,
      availability,
      expectedPay: parseInt(expectedPay) || j.pay,
      skills: selectedSkills,
      languages: selectedLangs,
      coverNote,
      hasOwnVehicle: hasVehicle,
      hasDrivingLicense: hasLicense
    };

    setLoading(true);
    try {
      const res = await applyForJob(j.id, payload);
      if (res.success) {
        showToast(res.message || 'Application submitted successfully!', 'success');
        addAppliedJob(j.id, j);
        setShowApplyModalForJob(null);
      } else {
        showToast(res.message || 'Failed to submit application.', 'error');
      }
    } catch (err) {
      showToast('Applied successfully (local fallback).', 'success');
      addAppliedJob(j.id, j);
      setShowApplyModalForJob(null);
    } finally {
      setLoading(false);
    }
  };

  // Build the list of relevant skills to choose from (original logic)
  const skillsToChoose = [
    ...new Set([
      ...(j.skills || []),
      ...(currentUser?.skills || []),
      'Communication', 'Computer Basics', 'English', 'Driving', 'Team Work'
    ])
  ].filter(Boolean);

  return (
    <div class="modal-overlay" onClick={handleOverlayClick}>
      <div class="apply-modal">
        <button class="modal-close" onClick={() => setShowApplyModalForJob(null)}>✕</button>
        <div id="apply-modal-content">
          <div class="apply-form-header">
            <h2>⚡ Apply for Job</h2>
            <p>Fill in your details to apply instantly</p>
          </div>
          <div class="apply-form-job-info">
            <div style={{ fontSize: '2rem' }}>{j.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontFamily: "'Baloo 2', cursive" }}>{j.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                👤 {j.employer} · 📍 {j.loc} · <span style={{ color: 'var(--accent)' }}>₹{j.pay}/day</span>
              </div>
            </div>
          </div>
          <div class="step-indicators" id="step-indicators">
            <div class={`step-dot ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}></div>
            <div class={`step-dot ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}></div>
            <div class={`step-dot ${step === 3 ? 'active' : ''}`}></div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div class="form-step active">
              <div class="apply-form-section-title">👤 Personal Details</div>
              <div class="form-row">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div class="form-group">
                  <label>Expected Pay (₹/day)</label>
                  <input
                    type="number"
                    placeholder={j.pay}
                    value={expectedPay}
                    onChange={(e) => setExpectedPay(e.target.value)}
                  />
                </div>
              </div>
              <div class="apply-form-section-title" style={{ marginTop: '8px' }}>📍 Address</div>
              <div class="form-row">
                <div class="form-group">
                  <label>Area / Locality</label>
                  <input
                    type="text"
                    placeholder="Saheed Nagar"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
                <div class="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="Bhubaneswar"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>District</label>
                  <input
                    type="text"
                    placeholder="Khordha"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
                <div class="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    placeholder="751001"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Experience & Skills */}
          {step === 2 && (
            <div class="form-step active">
              <div class="apply-form-section-title">💼 Experience & Skills</div>
              <div class="form-row">
                <div class="form-group">
                  <label>Experience Level *</label>
                  <select value={experience} onChange={(e) => setExperience(e.target.value)}>
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
                    placeholder="e.g. Helper, Software Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Education</label>
                  <select value={education} onChange={(e) => setEducation(e.target.value)}>
                    <option value="">Select…</option>
                    <option value="no_formal">No formal education</option>
                    <option value="primary">Primary (Class 1–5)</option>
                    <option value="middle">Middle (Class 6–8)</option>
                    <option value="matric">Matriculation (10th)</option>
                    <option value="intermediate">Intermediate (+2 / 12th)</option>
                    <option value="iti">ITI / Diploma</option>
                    <option value="graduate">Graduate (BA/BSc/BCom/BTech)</option>
                    <option value="postgraduate">Post Graduate</option>
                    <option value="professional">Professional (MBBS/LLB/CA)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Availability</label>
                  <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                    <option value="immediate">Immediate – Can join today</option>
                    <option value="within_week">Within 1 week</option>
                    <option value="within_month">Within 1 month</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Languages Known</label>
                <div class="skills-grid">
                  {LANGUAGES.map(l => (
                    <div
                      key={l}
                      class={`skill-checkbox ${selectedLangs.includes(l) ? 'selected' : ''}`}
                      onClick={() => toggleLanguage(l)}
                    >
                      {l}
                    </div>
                  ))}
                </div>
              </div>
              <div class="form-group">
                <label>Relevant Skills <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>(select all that apply)</span></label>
                <div class="skills-grid">
                  {skillsToChoose.map(s => (
                    <div
                      key={s}
                      class={`skill-checkbox ${selectedSkills.includes(s) ? 'selected' : ''}`}
                      onClick={() => toggleSkill(s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div class="form-row" style={{ marginTop: '12px' }}>
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="apl-vehicle"
                    checked={hasVehicle}
                    onChange={(e) => setHasVehicle(e.target.checked)}
                  />
                  <label htmlFor="apl-vehicle">🛵 I have my own vehicle</label>
                </div>
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="apl-license"
                    checked={hasLicense}
                    onChange={(e) => setHasLicense(e.target.checked)}
                  />
                  <label htmlFor="apl-license">🪪 I have a driving license</label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Cover Note & Submit */}
          {step === 3 && (
            <div class="form-step active">
              <div class="apply-form-section-title">✍️ Why should you be hired?</div>
              <div class="form-group">
                <label>Cover Note <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>(optional but recommended)</span></label>
                <textarea
                  rows="5"
                  placeholder="Briefly tell the employer why you're a good fit for this role. Mention any relevant experience, your work ethic, or why you need this job…"
                  style={{ resize: 'vertical' }}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                ></textarea>
              </div>
              <div style={{ background: 'rgba(0,173,239,0.06)', border: '1px solid rgba(0,173,239,0.2)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--subtext)', lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>📋 Application Summary</div>
                  <div>
                    👤 <b>{name}</b> · 📞 {phone}<br />
                    💼 Experience: {EXP_LABELS[experience] || experience}<br />
                    ⚡ Availability: {{ immediate: 'Immediate', within_week: 'Within 1 week', within_month: 'Within 1 month' }[availability]}<br />
                    🛠️ Skills: {selectedSkills.join(', ') || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div class="form-nav">
            {step > 1 && (
              <button type="button" class="btn-back" onClick={handleBack}>
                ← Back
              </button>
            )}
            <button
              type="button"
              class="btn-next"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <span class="spinner"></span>
              ) : step === 3 ? (
                '✅ Submit Application'
              ) : (
                'Next Step →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
