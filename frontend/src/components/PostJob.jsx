import { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'construction', label: 'Construction', icon: '🏗️' },
  { id: 'it_tech', label: 'IT / Tech', icon: '💻' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'finance', label: 'Finance', icon: '📊' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'marketing', label: 'Marketing', icon: '📱' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'logistics', label: 'Logistics', icon: '📦' },
  { id: 'hospitality', label: 'Hospitality', icon: '🏨' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { id: 'delivery', label: 'Delivery', icon: '🚚' },
  { id: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { id: 'domestic', label: 'Domestic', icon: '🏠' },
  { id: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { id: 'other', label: 'Other', icon: '💼' }
];

export default function PostJob({ setActiveTab }) {
  const { postJob } = useJobs();
  const { currentUser } = useAuth();
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('construction');
  const [pay, setPay] = useState('');
  const [workers, setWorkers] = useState('1');
  const [area, setArea] = useState('');
  const [duration, setDuration] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('none');
  const [skills, setSkills] = useState('');
  const [desc, setDesc] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !pay || !area || !desc || !phone) {
      setError('Please fill all required fields.');
      return;
    }

    const categoryIcon = CATEGORIES.find(c => c.id === selectedCategory)?.icon || '💼';

    const payload = {
      title,
      category: selectedCategory,
      payPerDay: parseInt(pay),
      workersNeeded: parseInt(workers) || 1,
      location: { area, city: 'Bhubaneswar' },
      duration,
      contactPhone: phone,
      experienceRequired: experience,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      description: desc,
      isUrgent: urgent,
      icon: categoryIcon
    };

    setLoading(true);
    try {
      const res = await postJob(payload);
      if (res.success) {
        setSuccess(res.message || 'Job posted successfully!');
        // Reset form
        setTitle('');
        setPay('');
        setWorkers('1');
        setArea('');
        setDuration('');
        setSkills('');
        setDesc('');
        setUrgent(false);
        setTimeout(() => {
          setActiveTab('find');
        }, 1200);
      } else {
        setError(res.message || 'Failed to post job.');
      }
    } catch (err) {
      setError('Failed to post job due to connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="panel-post" class="active">
      <div class="post-job-form">
        <h2>📋 Post a Job Opening</h2>
        {error && <div class="auth-error" style={{ display: 'block' }}>⚠️ {error}</div>}
        {success && <div class="auth-success" style={{ display: 'block' }}>✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              placeholder="e.g. Software Developer, Construction Helper, Nurse"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div class="form-group">
            <label>Category *</label>
            <div class="category-grid" id="category-grid">
              {CATEGORIES.map(c => (
                <div
                  key={c.id}
                  class={`cat-option ${selectedCategory === c.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(c.id)}
                >
                  <div class="cat-icon">{c.icon}</div>
                  <div class="cat-label">{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Pay Per Day (₹) *</label>
              <input
                type="number"
                placeholder="500"
                value={pay}
                onChange={(e) => setPay(e.target.value)}
                required
              />
            </div>
            <div class="form-group">
              <label>Workers Needed *</label>
              <input
                type="number"
                placeholder="1"
                min="1"
                value={workers}
                onChange={(e) => setWorkers(e.target.value)}
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Location / Area *</label>
              <input
                type="text"
                placeholder="Saheed Nagar, Bhubaneswar"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />
            </div>
            <div class="form-group">
              <label>Duration</label>
              <input
                type="text"
                placeholder="1 week, Permanent, 3 months"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Contact Phone *</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div class="form-group">
              <label>Experience Required</label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option value="none">No experience needed</option>
                <option value="fresher">Fresher welcome</option>
                <option value="less_than_1">Less than 1 year</option>
                <option value="1_to_3">1–3 years</option>
                <option value="3_to_5">3–5 years</option>
                <option value="5_plus">5+ years</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Skills Required (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Heavy Lifting, Basic Tools, English"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div class="form-group">
            <label>Job Description *</label>
            <textarea
              rows="4"
              placeholder="Describe the job responsibilities, timings, any specific requirements…"
              style={{ resize: 'vertical' }}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            ></textarea>
          </div>

          <div class="form-check" style={{ marginBottom: '16px' }}>
            <input
              type="checkbox"
              id="post-urgent"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
            <label htmlFor="post-urgent">🔴 Mark as Urgent – show at top of listings</label>
          </div>

          <button type="submit" class="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            {loading ? <span class="spinner"></span> : '📋 Post Job Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
