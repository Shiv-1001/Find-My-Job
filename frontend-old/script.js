// ========== STATE ==========
const API = 'http://localhost:5000/api';
let currentUser = null;
let authToken = null;
let jobs = [];
let appliedJobs = new Set();
let activeFilter = 'all';
let sortMode = 'latest';
let selectedCategory = 'construction';
let currentApplyJobId = null;
let applyStep = 1;
const TOTAL_STEPS = 3;

// ========== INIT ==========
(function init() {
  authToken = localStorage.getItem('kd_token');
  const savedUser = localStorage.getItem('kd_user');
  if (authToken && savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
  } else {
    showAuth();
  }
})();

// ========== AUTH HELPERS ==========
function showAuth() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app-screen').style.display = 'none';
}
function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  updateHeaderUser();
  loadJobs();
  renderProfile();
  // Pre-fill post job phone
  if (currentUser) document.getElementById('post-phone').value = currentUser.phone || '';
}

function updateHeaderUser() {
  if (!currentUser) return;
  document.getElementById('header-name').textContent = currentUser.name.split(' ')[0];
  document.getElementById('header-avatar').textContent = currentUser.role === 'employer' ? '🏢' : '👷';
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[tab === 'login' ? 0 : 1].classList.add('active');
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  clearAuthMessages();
}

function clearAuthMessages() {
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-success').style.display = 'none';
}
function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = '⚠️ ' + msg; el.style.display = 'block';
  document.getElementById('auth-success').style.display = 'none';
}
function showAuthSuccess(msg) {
  const el = document.getElementById('auth-success');
  el.textContent = '✅ ' + msg; el.style.display = 'block';
  document.getElementById('auth-error').style.display = 'none';
}

function selectRole(role) {
  document.getElementById('role-worker').classList.toggle('selected', role === 'worker');
  document.getElementById('role-employer').classList.toggle('selected', role === 'employer');
  document.getElementById('worker-fields').style.display = role === 'worker' ? 'block' : 'none';
  document.getElementById('employer-fields').style.display = role === 'employer' ? 'block' : 'none';
}

// ========== LOGIN ==========
async function handleLogin() {
  clearAuthMessages();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) return showAuthError('Please enter email and password.');

  const btn = document.getElementById('btn-login');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Logging in…';

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) { showAuthError(data.message); return; }
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('kd_token', authToken);
    localStorage.setItem('kd_user', JSON.stringify(currentUser));
    showApp();
    showToast('✅ ' + data.message, false, true);
  } catch (err) {
    // Demo mode - offline fallback
    if (email && password === 'demo123') {
      offlineLogin(email.includes('employer') ? 'employer' : 'worker', email);
    } else {
      showAuthError('Cannot connect to server. Use demo login or start the backend.');
    }
  } finally {
    btn.disabled = false; btn.innerHTML = 'Login to Find My Job';
  }
}

function offlineLogin(role, email) {
  currentUser = {
    id: 'demo_' + Date.now(),
    name: role === 'employer' ? 'Demo Employer' : 'Demo Worker',
    email: email,
    phone: '9876543210',
    role: role,
    address: { area: 'Saheed Nagar', city: 'Bhubaneswar' },
    skills: ['Heavy Lifting', 'Basic Tools'],
    experience: '1_to_3'
  };
  authToken = 'demo_token';
  localStorage.setItem('kd_token', authToken);
  localStorage.setItem('kd_user', JSON.stringify(currentUser));
  showApp();
}

async function demoLogin(role) {
  offlineLogin(role, role + '@demo.com');
  showToast('✅ Logged in as Demo ' + (role === 'worker' ? 'Worker' : 'Employer'), false, true);
}

// ========== REGISTER ==========
async function handleRegister() {
  clearAuthMessages();
  const role = document.getElementById('role-worker').classList.contains('selected') ? 'worker' : 'employer';
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const area = document.getElementById('reg-area').value.trim();
  const city = document.getElementById('reg-city').value.trim() || 'Bhubaneswar';

  if (!name || !phone || !email || !password) return showAuthError('Please fill all required fields.');
  if (phone.length !== 10 || !/^\d+$/.test(phone)) return showAuthError('Enter a valid 10-digit phone number.');
  if (password.length < 6) return showAuthError('Password must be at least 6 characters.');
  if (password !== confirm) return showAuthError('Passwords do not match.');

  const payload = {
    name, phone, email, password, role,
    address: { area, city },
    experience: document.getElementById('reg-experience')?.value || 'fresher',
    currentJobTitle: document.getElementById('reg-jobtitle')?.value || '',
    companyName: document.getElementById('reg-company')?.value || ''
  };

  const btn = document.getElementById('btn-register');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Creating account…';

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) { showAuthError(data.message); return; }
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('kd_token', authToken);
    localStorage.setItem('kd_user', JSON.stringify(currentUser));
    showAuthSuccess('Account created! Welcome to Find My Job!');
    setTimeout(() => showApp(), 800);
  } catch (err) {
    // Offline fallback
    currentUser = { id: 'demo_' + Date.now(), name, phone, email, role, address: { area, city }, skills: [], experience: 'fresher' };
    authToken = 'offline_' + Date.now();
    localStorage.setItem('kd_token', authToken);
    localStorage.setItem('kd_user', JSON.stringify(currentUser));
    showAuthSuccess('Account created (offline mode)! Welcome, ' + name + '!');
    setTimeout(() => showApp(), 800);
  } finally {
    btn.disabled = false; btn.innerHTML = 'Create Account';
  }
}

function handleLogout() {
  localStorage.removeItem('kd_token');
  localStorage.removeItem('kd_user');
  currentUser = null; authToken = null;
  appliedJobs = new Set();
  showAuth();
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

// ========== JOBS ==========
async function loadJobs() {
  try {
    const res = await fetch(`${API}/jobs?limit=50`, {
      headers: authToken && !authToken.startsWith('demo') && !authToken.startsWith('offline')
        ? { Authorization: `Bearer ${authToken}` } : {}
    });
    const data = await res.json();
    if (data.success) {
      jobs = data.jobs.map(j => ({
        id: j._id, title: j.title, employer: j.employerName || 'Employer',
        cat: j.category, pay: j.payPerDay, workers: j.workersNeeded, hired: j.workersHired,
        loc: j.location?.area || 'Bhubaneswar', dist: (Math.random() * 8 + 0.5).toFixed(1) + ' km',
        dur: j.duration || 'Ongoing', skills: j.skills || [],
        desc: j.description, urgent: j.isUrgent, time: timeAgo(j.postedAt),
        phone: j.contactPhone, icon: j.icon || '💼', expRequired: j.experienceRequired
      }));
      document.getElementById('s-jobs').textContent = data.total || jobs.length;
    } else { loadSampleJobs(); }
  } catch (e) { loadSampleJobs(); }
  filterJobs();
}

function loadSampleJobs() {
  jobs = [
    { id: 1, title: 'Construction Helper', employer: 'Patel Builders', cat: 'construction', pay: 550, workers: 5, hired: 2, loc: 'Saheed Nagar', dist: '1.2 km', dur: '2 weeks', skills: ['Heavy Lifting', 'Basic Tools'], desc: 'Need helpers for concrete pouring and material carrying. 8AM–6PM. Safety equipment provided.', urgent: true, time: '2 hrs ago', phone: '9876543210', icon: '🏗️' },
    { id: 2, title: 'Software Developer (React)', employer: 'TechVenture Pvt Ltd', cat: 'it_tech', pay: 2500, workers: 2, hired: 0, loc: 'Infocity', dist: '4.5 km', dur: '3 months', skills: ['React', 'JavaScript', 'Node.js'], desc: 'Build web applications for an e-commerce startup. Remote or on-site options available.', urgent: true, time: '1 hr ago', phone: '9876001234', icon: '💻', expRequired: '1_to_3' },
    { id: 3, title: 'Hospital Nurse (GNM)', employer: 'Apollo Clinic', cat: 'healthcare', pay: 1200, workers: 3, hired: 1, loc: 'Chandrasekharpur', dist: '3.8 km', dur: 'Permanent', skills: ['GNM Degree', 'Patient Care', 'IV Administration'], desc: 'General nursing duties in medicine ward. Day/Night shifts. PF and ESI provided.', urgent: true, time: '3 hrs ago', phone: '9800012345', icon: '🏥' },
    { id: 4, title: 'Accounts Manager', employer: 'Reliance Traders', cat: 'finance', pay: 1800, workers: 1, hired: 0, loc: 'Nayapalli', dist: '2.9 km', dur: 'Permanent', skills: ['Tally', 'MS Excel', 'GST Filing', 'TDS'], desc: 'Manage day-to-day accounts, GST filing, financial reporting, and audit preparation.', urgent: false, time: '5 hrs ago', phone: '9898001122', icon: '📊' },
    { id: 5, title: 'Primary School Teacher', employer: 'Saraswati Vidya Mandir', cat: 'education', pay: 900, workers: 2, hired: 1, loc: 'Unit-9', dist: '5.1 km', dur: 'Academic year', skills: ['B.Ed', 'English', 'Math', 'Odia'], desc: 'Teach Maths and English for classes 1–5. Morning shift 7AM–12PM.', urgent: false, time: '6 hrs ago', phone: '9776543210', icon: '📚' },
    { id: 6, title: 'Graphic Designer', employer: 'Creative Studio Odisha', cat: 'design', pay: 1500, workers: 2, hired: 0, loc: 'Saheed Nagar', dist: '1.8 km', dur: '6 months', skills: ['Photoshop', 'Illustrator', 'Canva', 'After Effects'], desc: 'Create social media content, branding materials, and digital ads for multiple clients.', urgent: false, time: '4 hrs ago', phone: '9900112233', icon: '🎨' },
    { id: 7, title: 'Digital Marketing Executive', employer: 'GrowFast Digital', cat: 'marketing', pay: 1300, workers: 1, hired: 0, loc: 'Patia', dist: '6.2 km', dur: 'Permanent', skills: ['SEO', 'Social Media', 'Google Ads', 'Analytics'], desc: 'Manage social media accounts, run paid campaigns, create content strategy. Min 1 yr exp.', urgent: false, time: '8 hrs ago', phone: '9090901234', icon: '📱' },
    { id: 8, title: 'Hotel Receptionist', employer: 'Swosti Grand Hotel', cat: 'hospitality', pay: 700, workers: 2, hired: 0, loc: 'Janpath', dist: '3.4 km', dur: 'Permanent', skills: ['Communication', 'Computer Basics', 'English', 'Hindi'], desc: 'Handle hotel check-ins, reservations and guest services. Smart and presentable required.', urgent: false, time: '1 day ago', phone: '9654321098', icon: '🏨' },
    { id: 9, title: 'Security Guard', employer: 'Infocity Mall', cat: 'security', pay: 500, workers: 2, hired: 2, loc: 'Infocity', dist: '5.5 km', dur: '1 month', skills: ['Security Training'], desc: 'Night shift 10PM–6AM. Uniform provided. Ex-servicemen preferred.', urgent: false, time: '1 day ago', phone: '9123456780', icon: '🔒' },
    { id: 10, title: 'Warehouse Supervisor', employer: 'Amazon Delivery Hub', cat: 'logistics', pay: 1000, workers: 4, hired: 2, loc: 'Rasulgarh', dist: '3.9 km', dur: 'Permanent', skills: ['Inventory Management', 'WMS Software', 'Team Leadership'], desc: 'Manage warehouse operations, track inventory, supervise loading/unloading teams.', urgent: true, time: '2 hrs ago', phone: '9012345678', icon: '📦' },
    { id: 11, title: 'Delivery Rider (Bike)', employer: 'QuickMart', cat: 'delivery', pay: 600, workers: 3, hired: 1, loc: 'Khandagiri', dist: '4.1 km', dur: 'Ongoing', skills: ['Driving License', 'Own Bike', 'Smart Phone'], desc: '2-wheeler delivery. Must have own bike and driving license. Incentives on deliveries.', urgent: true, time: '6 hrs ago', phone: '9988776655', icon: '🚚' },
    { id: 12, title: 'Domestic Cook', employer: 'Kapoor Family', cat: 'domestic', pay: 450, workers: 1, hired: 0, loc: 'Nayapalli', dist: '3.2 km', dur: 'Ongoing', skills: ['North Indian Cooking', 'Veg & Non-veg'], desc: 'Cook lunch and dinner for family of 4. North Indian and Odia food. Experience required.', urgent: false, time: '5 hrs ago', phone: '9800011223', icon: '🏠' },
    { id: 13, title: 'House Cleaner', employer: 'Mrs. Sharma', cat: 'cleaning', pay: 400, workers: 1, hired: 0, loc: 'Patia', dist: '2.8 km', dur: '1 day', skills: ['No skill needed'], desc: 'Full house cleaning for 3BHK apartment. 9AM start. Cleaning supplies provided.', urgent: false, time: '4 hrs ago', phone: '9812345678', icon: '🧹' },
    { id: 14, title: 'Farm Worker', employer: 'Mishra Farms', cat: 'agriculture', pay: 350, workers: 8, hired: 3, loc: 'Khordha', dist: '12 km', dur: '1 week', skills: ['No skill needed'], desc: 'Paddy harvesting work. Daily transport from Master Canteen square, Bhubaneswar.', urgent: false, time: '1 day ago', phone: '9087654321', icon: '🌾' },
    { id: 15, title: 'Legal Associate (LLB)', employer: 'Mohanty & Partners Advocates', cat: 'legal', pay: 1400, workers: 1, hired: 0, loc: 'Cuttak Rd', dist: '7.2 km', dur: '6 months', skills: ['LLB Degree', 'Drafting', 'Research', 'Court Filing'], desc: 'Handle civil & commercial cases, draft legal documents, conduct legal research.', urgent: false, time: '2 days ago', phone: '9090001112', icon: '⚖️' },
    { id: 16, title: 'Civil Engineer (Site)', employer: 'Odisha Infrastructure Ltd', cat: 'engineering', pay: 2000, workers: 2, hired: 0, loc: 'Bhubaneswar', dist: '8.0 km', dur: '1 year', skills: ['B.Tech Civil', 'AutoCAD', 'Site Supervision', 'MS Project'], desc: 'Supervise residential project construction, ensure quality control and timeline adherence.', urgent: true, time: '3 hrs ago', phone: '9811223344', icon: '🔧' },
  ];
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return Math.floor(diff / 60) + ' mins ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hrs ago';
  return Math.floor(diff / 86400) + ' days ago';
}

function renderJobs(list) {
  const grid = document.getElementById('jobs-grid');
  const count = document.getElementById('jobs-count');
  count.textContent = `(${list.length})`;
  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--muted);"><div style="font-size:3rem;margin-bottom:12px;">🔍</div><div style="font-family:'Baloo 2',cursive;font-size:1.1rem;">No jobs found</div><div style="font-size:0.83rem;margin-top:6px;">Try a different category or search term</div></div>`;
    return;
  }
  grid.innerHTML = list.map(j => {
    const isFilled = j.hired >= j.workers;
    const isApplied = appliedJobs.has(j.id);
    const catLabel = { construction:'Construction', it_tech:'IT/Tech', healthcare:'Healthcare', finance:'Finance', education:'Education', cleaning:'Cleaning', delivery:'Delivery', security:'Security', hospitality:'Hospitality', marketing:'Marketing', design:'Design', logistics:'Logistics', agriculture:'Agriculture', domestic:'Domestic', manufacturing:'Manufacturing', legal:'Legal', engineering:'Engineering', other:'Other' }[j.cat] || j.cat;
    return `
    <div class="job-card" onclick="openJob('${j.id}')">
      <div class="job-top">
        <div class="job-icon ${j.urgent ? 'job-urgent' : 'job-norm'}">${j.icon}</div>
        <div class="job-badges">
          ${j.urgent ? '<div class="badge badge-urgent">🔴 URGENT</div>' : ''}
          ${!isFilled && !j.urgent ? '<div class="badge badge-new">NEW</div>' : ''}
          ${isFilled ? '<div class="badge badge-filled">FILLED</div>' : ''}
          <div class="badge badge-cat">${catLabel}</div>
        </div>
      </div>
      <div class="job-title">${j.title}</div>
      <div class="job-employer">👤 ${j.employer}</div>
      <div class="job-meta">
        <div class="job-meta-item">📍 ${j.loc} · ${j.dist}</div>
        <div class="job-meta-item">⏱ ${j.dur}</div>
        <div class="job-meta-item">👥 ${j.workers - j.hired} spots left</div>
        ${j.expRequired && j.expRequired !== 'none' ? `<div class="job-meta-item">🎯 ${expLabel(j.expRequired)}</div>` : ''}
      </div>
      <div class="job-pay">₹${j.pay.toLocaleString()}<span style="font-size:0.85rem;color:var(--muted)">/day</span></div>
      <div class="job-footer">
        <div class="job-time">🕐 ${j.time}</div>
        <button class="btn-apply ${isApplied ? 'applied' : isFilled ? 'filled' : ''}"
          onclick="event.stopPropagation(); ${isFilled || isApplied ? '' : `openApplyModal('${j.id}')`}"
          ${isFilled ? 'disabled' : ''}>
          ${isApplied ? '✅ Applied' : isFilled ? 'Filled' : '⚡ Apply Now'}
        </button>
      </div>
    </div>`;
  }).join('');
}

function expLabel(v) {
  return { fresher: 'Fresher OK', less_than_1: '<1 yr exp', '1_to_3': '1–3 yrs', '3_to_5': '3–5 yrs', '5_plus': '5+ yrs', none: 'No exp' }[v] || v;
}

function filterJobs() {
  const q = document.getElementById('search-input').value.toLowerCase();
  let list = jobs.filter(j =>
    (activeFilter === 'all' || j.cat === activeFilter) &&
    (!q || j.title.toLowerCase().includes(q) || j.employer.toLowerCase().includes(q) ||
     j.loc.toLowerCase().includes(q) || j.skills.join(' ').toLowerCase().includes(q))
  );
  if (sortMode === 'pay') list.sort((a,b) => b.pay - a.pay);
  else if (sortMode === 'nearby') list.sort((a,b) => parseFloat(a.dist) - parseFloat(b.dist));
  else list.sort((a,b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  renderJobs(list);
}

function setFilter(el, cat) {
  document.querySelectorAll('.filter-row .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active'); activeFilter = cat; filterJobs();
}

function sortJobs() {
  const modes = ['latest', 'pay', 'nearby'];
  const labels = ['Latest', 'Highest Pay', 'Nearest'];
  const idx = (modes.indexOf(sortMode) + 1) % 3;
  sortMode = modes[idx];
  document.getElementById('sort-label').textContent = labels[idx];
  filterJobs();
}

// ========== JOB MODAL ==========
function openJob(id) {
  const j = jobs.find(j => String(j.id) === String(id));
  if (!j) return;
  const isFilled = j.hired >= j.workers;
  const isApplied = appliedJobs.has(j.id);
  document.getElementById('modal-content').innerHTML = `
    <div style="font-size:2.5rem;margin-bottom:8px;">${j.icon}</div>
    <h2 style="font-family:'Baloo 2',cursive;font-size:1.4rem;">${j.title}</h2>
    <div style="color:var(--subtext);font-size:0.85rem;margin-bottom:4px;">👤 ${j.employer}</div>
    <div class="modal-pay">₹${j.pay.toLocaleString()}<span style="font-size:0.9rem;color:var(--muted)">/day</span></div>
    <div class="modal-meta">
      <div class="modal-meta-item">📍 ${j.loc} · ${j.dist}</div>
      <div class="modal-meta-item">⏱ ${j.dur}</div>
      <div class="modal-meta-item">👥 ${j.workers} needed · ${j.hired} hired</div>
      <div class="modal-meta-item">📞 ${j.phone}</div>
      ${j.expRequired && j.expRequired !== 'none' ? `<div class="modal-meta-item">🎯 ${expLabel(j.expRequired)}</div>` : ''}
    </div>
    ${j.skills.length ? `<div style="margin-bottom:14px;"><div style="font-size:0.78rem;color:var(--muted);margin-bottom:8px;">Skills required:</div><div style="display:flex;gap:6px;flex-wrap:wrap;">${j.skills.map(s=>`<span class="skill-tag selected">${s}</span>`).join('')}</div></div>` : ''}
    <div class="modal-desc">${j.desc}</div>
    <div class="modal-actions">
      <button class="btn-call" onclick="showToast('📞 Calling ${j.phone}…')">📞 ${j.phone}</button>
      <button class="btn-primary btn-modal ${isApplied ? 'applied' : isFilled ? 'filled' : ''}"
        onclick="${isApplied || isFilled ? '' : `closeModal(); openApplyModal('${j.id}')`}"
        ${isFilled ? 'disabled' : ''} style="flex:1;">
        ${isApplied ? '✅ Already Applied' : isFilled ? 'Position Filled' : '⚡ Apply Now'}
      </button>
    </div>`;
  document.getElementById('modal').style.display = 'flex';
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal')) return;
  document.getElementById('modal').style.display = 'none';
}

// ========== APPLICATION FORM MODAL ==========
function openApplyModal(id) {
  const j = jobs.find(j => String(j.id) === String(id));
  if (!j) return;
  if (!currentUser) { showToast('Please login to apply.', true); return; }
  if (appliedJobs.has(j.id)) { showToast('You already applied for this job!', true); return; }

  currentApplyJobId = j.id;
  applyStep = 1;

  const u = currentUser;
  document.getElementById('apply-modal-content').innerHTML = `
    <div class="apply-form-header">
      <h2>⚡ Apply for Job</h2>
      <p>Fill in your details to apply instantly</p>
    </div>
    <div class="apply-form-job-info">
      <div style="font-size:2rem;">${j.icon}</div>
      <div>
        <div style="font-weight:700;font-family:'Baloo 2',cursive;">${j.title}</div>
        <div style="font-size:0.8rem;color:var(--muted);">👤 ${j.employer} · 📍 ${j.loc} · <span style="color:var(--accent);">₹${j.pay}/day</span></div>
      </div>
    </div>
    <div class="step-indicators" id="step-indicators">
      <div class="step-dot active" id="dot-1"></div>
      <div class="step-dot" id="dot-2"></div>
      <div class="step-dot" id="dot-3"></div>
    </div>
    <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:33%"></div></div>

    <!-- STEP 1: Personal Details -->
    <div class="form-step active" id="step-1">
      <div class="apply-form-section-title">👤 Personal Details</div>
      <div class="form-row">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="apl-name" value="${u.name || ''}" placeholder="Ramesh Kumar"/>
        </div>
        <div class="form-group">
          <label>Phone Number *</label>
          <input type="tel" id="apl-phone" value="${u.phone || ''}" placeholder="9876543210" maxlength="10"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="apl-email" value="${u.email || ''}" placeholder="your@email.com"/>
        </div>
        <div class="form-group">
          <label>Expected Pay (₹/day)</label>
          <input type="number" id="apl-expectedpay" placeholder="${j.pay}" value="${u.expectedPay || j.pay}"/>
        </div>
      </div>
      <div class="apply-form-section-title" style="margin-top:8px;">📍 Address</div>
      <div class="form-row">
        <div class="form-group">
          <label>Area / Locality</label>
          <input type="text" id="apl-area" value="${u.address?.area || ''}" placeholder="Saheed Nagar"/>
        </div>
        <div class="form-group">
          <label>City</label>
          <input type="text" id="apl-city" value="${u.address?.city || 'Bhubaneswar'}" placeholder="Bhubaneswar"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>District</label>
          <input type="text" id="apl-district" value="${u.address?.district || 'Khordha'}" placeholder="Khordha"/>
        </div>
        <div class="form-group">
          <label>Pincode</label>
          <input type="text" id="apl-pincode" value="${u.address?.pincode || ''}" placeholder="751001" maxlength="6"/>
        </div>
      </div>
    </div>

    <!-- STEP 2: Experience & Skills -->
    <div class="form-step" id="step-2">
      <div class="apply-form-section-title">💼 Experience & Skills</div>
      <div class="form-row">
        <div class="form-group">
          <label>Experience Level *</label>
          <select id="apl-experience">
            <option value="fresher" ${u.experience==='fresher'?'selected':''}>Fresher (No experience)</option>
            <option value="less_than_1" ${u.experience==='less_than_1'?'selected':''}>Less than 1 year</option>
            <option value="1_to_3" ${u.experience==='1_to_3'?'selected':''}>1–3 years</option>
            <option value="3_to_5" ${u.experience==='3_to_5'?'selected':''}>3–5 years</option>
            <option value="5_plus" ${u.experience==='5_plus'?'selected':''}>5+ years</option>
          </select>
        </div>
        <div class="form-group">
          <label>Current / Last Job Title</label>
          <input type="text" id="apl-jobtitle" value="${u.currentJobTitle || ''}" placeholder="e.g. Helper, Software Developer"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Education</label>
          <select id="apl-education">
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
          <select id="apl-availability">
            <option value="immediate">Immediate – Can join today</option>
            <option value="within_week">Within 1 week</option>
            <option value="within_month">Within 1 month</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Languages Known</label>
        <div class="skills-grid" id="lang-grid">
          ${['Odia','Hindi','English','Bengali','Telugu','Urdu'].map(l =>
            `<div class="skill-checkbox ${(u.languages||[]).includes(l)?'selected':''}" onclick="toggleSkill(this,'lang')">${l}</div>`
          ).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>Relevant Skills <span style="color:var(--muted);font-size:0.75rem;">(select all that apply)</span></label>
        <div class="skills-grid" id="skills-select-grid">
          ${[...new Set([...(j.skills||[]), ...(u.skills||[]), 'Communication','Computer Basics','English','Driving','Team Work'])].filter(Boolean).map(s =>
            `<div class="skill-checkbox ${(u.skills||[]).includes(s)?'selected':''}" onclick="toggleSkill(this,'skill')">${s}</div>`
          ).join('')}
        </div>
      </div>
      <div class="form-row" style="margin-top:12px;">
        <div class="form-check">
          <input type="checkbox" id="apl-vehicle"/>
          <label for="apl-vehicle">🛵 I have my own vehicle</label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="apl-license"/>
          <label for="apl-license">🪪 I have a driving license</label>
        </div>
      </div>
    </div>

    <!-- STEP 3: Cover Note & Submit -->
    <div class="form-step" id="step-3">
      <div class="apply-form-section-title">✍️ Why should you be hired?</div>
      <div class="form-group">
        <label>Cover Note <span style="color:var(--muted);font-size:0.75rem;">(optional but recommended)</span></label>
        <textarea id="apl-cover" rows="5" placeholder="Briefly tell the employer why you're a good fit for this role. Mention any relevant experience, your work ethic, or why you need this job…" style="resize:vertical;"></textarea>
      </div>
      <div style="background:rgba(0,173,239,0.06);border:1px solid rgba(0,173,239,0.2);border-radius:14px;padding:16px;margin-bottom:16px;">
        <div style="font-size:0.82rem;color:var(--subtext);line-height:1.7;">
          <div style="font-weight:700;color:var(--text);margin-bottom:6px;">📋 Application Summary</div>
          <div id="apply-summary"></div>
        </div>
      </div>
    </div>

    <div class="form-nav" id="form-nav">
      <button class="btn-back" id="btn-back-apply" onclick="changeApplyStep(-1)" style="display:none;">← Back</button>
      <button class="btn-next" id="btn-next-apply" onclick="changeApplyStep(1)">Next Step →</button>
    </div>`;

  document.getElementById('apply-modal').style.display = 'flex';
}

function toggleSkill(el, type) { el.classList.toggle('selected'); }

function changeApplyStep(dir) {
  const newStep = applyStep + dir;

  if (dir === 1) {
    if (applyStep === 1) {
      const name = document.getElementById('apl-name').value.trim();
      const phone = document.getElementById('apl-phone').value.trim();
      if (!name || !phone) { showToast('Please fill your name and phone number.', true); return; }
      if (phone.length !== 10) { showToast('Enter a valid 10-digit phone number.', true); return; }
    }
    if (applyStep === 3) { submitApplication(); return; }
  }

  if (newStep === 3) {
    // Build summary
    const name = document.getElementById('apl-name').value;
    const phone = document.getElementById('apl-phone').value;
    const exp = document.getElementById('apl-experience').value;
    const availability = document.getElementById('apl-availability').value;
    const selectedSkills = [...document.querySelectorAll('#skills-select-grid .skill-checkbox.selected')].map(el => el.textContent);
    document.getElementById('apply-summary').innerHTML = `
      👤 <b>${name}</b> · 📞 ${phone}<br>
      💼 Experience: ${expLabel(exp)}<br>
      ⚡ Availability: ${{ immediate:'Immediate', within_week:'Within 1 week', within_month:'Within 1 month' }[availability]}<br>
      🛠️ Skills: ${selectedSkills.join(', ') || 'Not specified'}`;
  }

  applyStep = Math.max(1, Math.min(TOTAL_STEPS, newStep));
  document.querySelectorAll('.form-step').forEach((s, i) => s.classList.toggle('active', i + 1 === applyStep));
  document.querySelectorAll('.step-dot').forEach((d, i) => {
    d.classList.toggle('active', i + 1 === applyStep);
    d.classList.toggle('done', i + 1 < applyStep);
  });
  document.getElementById('progress-fill').style.width = (applyStep / TOTAL_STEPS * 100) + '%';
  document.getElementById('btn-back-apply').style.display = applyStep > 1 ? 'block' : 'none';
  document.getElementById('btn-next-apply').textContent = applyStep === TOTAL_STEPS ? '✅ Submit Application' : 'Next Step →';
}

async function submitApplication() {
  const btn = document.getElementById('btn-next-apply');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Submitting…';

  const selectedSkills = [...document.querySelectorAll('#skills-select-grid .skill-checkbox.selected')].map(el => el.textContent);
  const selectedLangs = [...document.querySelectorAll('#lang-grid .skill-checkbox.selected')].map(el => el.textContent);

  const payload = {
    jobId: currentApplyJobId,
    applicantDetails: {
      name: document.getElementById('apl-name').value.trim(),
      phone: document.getElementById('apl-phone').value.trim(),
      email: document.getElementById('apl-email').value.trim(),
      address: {
        area: document.getElementById('apl-area').value.trim(),
        city: document.getElementById('apl-city').value.trim(),
        district: document.getElementById('apl-district').value.trim(),
        pincode: document.getElementById('apl-pincode').value.trim()
      },
      experience: document.getElementById('apl-experience').value,
      currentJobTitle: document.getElementById('apl-jobtitle').value.trim(),
      education: document.getElementById('apl-education').value,
      availability: document.getElementById('apl-availability').value,
      expectedPay: parseInt(document.getElementById('apl-expectedpay').value) || 0,
      skills: selectedSkills,
      languages: selectedLangs,
      coverNote: document.getElementById('apl-cover').value.trim(),
      hasOwnVehicle: document.getElementById('apl-vehicle').checked,
      hasDrivingLicense: document.getElementById('apl-license').checked
    }
  };

  try {
    const res = await fetch(`${API}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      finalizeApplication(currentApplyJobId, data.message);
    } else {
      showToast(data.message || 'Error submitting application.', true);
    }
  } catch (err) {
    // Offline mode
    finalizeApplication(currentApplyJobId, '✅ Application submitted successfully!');
  } finally {
    btn.disabled = false;
    btn.textContent = '✅ Submit Application';
  }
}

function finalizeApplication(jobId, message) {
  appliedJobs.add(jobId);
  closeApplyModal();
  closeModal();
  filterJobs();
  renderProfile();
  showToast(message || '✅ Applied! Employer will contact you soon.', false, true);
}

function closeApplyModal(e) {
  if (e && e.target !== document.getElementById('apply-modal')) return;
  document.getElementById('apply-modal').style.display = 'none';
}

// ========== POST JOB ==========
function selectCategory(el) {
  document.querySelectorAll('.cat-option').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedCategory = el.dataset.cat;
}

async function handlePostJob() {
  const title = document.getElementById('post-title').value.trim();
  const pay = document.getElementById('post-pay').value;
  const area = document.getElementById('post-area').value.trim();
  const phone = document.getElementById('post-phone').value.trim();
  const desc = document.getElementById('post-desc').value.trim();

  if (!title || !pay || !area || !desc) {
    document.getElementById('post-error').textContent = '⚠️ Please fill all required fields.';
    document.getElementById('post-error').style.display = 'block';
    return;
  }

  const payload = {
    title,
    category: selectedCategory,
    payPerDay: parseInt(pay),
    workersNeeded: parseInt(document.getElementById('post-workers').value) || 1,
    location: { area, city: 'Bhubaneswar' },
    duration: document.getElementById('post-duration').value,
    contactPhone: phone,
    experienceRequired: document.getElementById('post-exp').value,
    skills: document.getElementById('post-skills').value.split(',').map(s => s.trim()).filter(Boolean),
    description: desc,
    isUrgent: document.getElementById('post-urgent').checked,
    icon: { construction:'🏗️', it_tech:'💻', healthcare:'🏥', finance:'📊', education:'📚', marketing:'📱', design:'🎨', logistics:'📦', hospitality:'🏨', security:'🔒', cleaning:'🧹', delivery:'🚚', agriculture:'🌾', domestic:'🏠', manufacturing:'🏭', other:'💼' }[selectedCategory] || '💼'
  };

  try {
    const res = await fetch(`${API}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('post-success').textContent = '✅ Job posted successfully!';
      document.getElementById('post-success').style.display = 'block';
      document.getElementById('post-error').style.display = 'none';
      // Add to local list
      jobs.unshift({ id: data.job?._id || Date.now(), ...payload, employer: currentUser.companyName || currentUser.name, hired: 0, workers: payload.workersNeeded, cat: selectedCategory, dist: '0.5 km', time: 'Just now', loc: area });
      filterJobs();
    } else {
      document.getElementById('post-error').textContent = '⚠️ ' + data.message;
      document.getElementById('post-error').style.display = 'block';
    }
  } catch (err) {
    // Offline
    jobs.unshift({ id: Date.now(), ...payload, employer: currentUser?.companyName || currentUser?.name || 'You', hired: 0, workers: payload.workersNeeded, cat: selectedCategory, dist: '0.5 km', time: 'Just now', loc: area });
    document.getElementById('post-success').textContent = '✅ Job posted (offline mode)!';
    document.getElementById('post-success').style.display = 'block';
    filterJobs();
  }
}

// ========== PROFILE ==========
function renderProfile() {
  if (!currentUser) return;
  const u = currentUser;
  const appliedList = [...appliedJobs].map(id => jobs.find(j => String(j.id) === String(id))).filter(Boolean);
  const expMap = { fresher: 'Fresher', less_than_1: '<1 yr exp', '1_to_3': '1–3 yrs exp', '3_to_5': '3–5 yrs exp', '5_plus': '5+ yrs exp' };

  document.getElementById('profile-panel-content').innerHTML = `
    <div class="profile-header">
      <div class="avatar">${u.role === 'employer' ? '🏢' : '👷'}</div>
      <div class="profile-info">
        <div class="profile-name">${u.name}</div>
        <p>📞 ${u.phone} &nbsp;|&nbsp; 📧 ${u.email}</p>
        ${u.address?.area ? `<p>📍 ${u.address.area}, ${u.address.city || 'Bhubaneswar'}</p>` : ''}
        ${u.role === 'worker' && u.experience ? `<p>💼 ${expMap[u.experience] || u.experience}</p>` : ''}
        ${u.role === 'employer' && u.companyName ? `<p>🏢 ${u.companyName}</p>` : ''}
        <div class="profile-stats">
          <div class="profile-stat"><div class="profile-stat-num">${appliedList.length}</div><div class="profile-stat-lbl">Applications</div></div>
          <div class="profile-stat"><div class="profile-stat-num">${u.totalJobsDone || 0}</div><div class="profile-stat-lbl">Jobs Done</div></div>
          <div class="profile-stat"><div class="profile-stat-num">${u.rating || '4.8'}⭐</div><div class="profile-stat-lbl">Rating</div></div>
        </div>
      </div>
    </div>

    ${u.skills?.length ? `
    <div class="profile-section">
      <h3>🛠️ My Skills</h3>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${u.skills.map(s => `<div class="skill-tag selected">${s}</div>`).join('')}
      </div>
    </div>` : ''}

    <div class="profile-section">
      <h3>📌 My Applications (${appliedList.length})</h3>
      ${appliedList.length ? appliedList.map(j => `
        <div class="history-item">
          <div>
            <div class="history-title">${j.icon} ${j.title}</div>
            <div class="history-sub">${j.employer} · 📍 ${j.loc}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
            <div class="history-pay">₹${j.pay}/day</div>
            <span class="app-status status-pending">Pending Review</span>
          </div>
        </div>`).join('') : `<div style="color:var(--muted);font-size:0.85rem;padding:10px 0;">No applications yet. Browse jobs and apply!</div>`}
    </div>

    <div class="profile-section">
      <h3>⚙️ Edit Profile</h3>
      <div class="form-row">
        <div class="form-group"><label>Phone</label><input type="tel" id="edit-phone" value="${u.phone||''}" placeholder="9876543210"/></div>
        <div class="form-group"><label>Area</label><input type="text" id="edit-area" value="${u.address?.area||''}" placeholder="Saheed Nagar"/></div>
      </div>
      ${u.role === 'worker' ? `
      <div class="form-row">
        <div class="form-group">
          <label>Experience</label>
          <select id="edit-exp">
            ${['fresher','less_than_1','1_to_3','3_to_5','5_plus'].map(v => `<option value="${v}" ${u.experience===v?'selected':''}>${expMap[v]}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Current Job Title</label><input type="text" id="edit-jobtitle" value="${u.currentJobTitle||''}" placeholder="Helper, Developer…"/></div>
      </div>
      <div class="form-group"><label>Skills (comma separated)</label><input type="text" id="edit-skills" value="${(u.skills||[]).join(', ')}" placeholder="Heavy Lifting, Driving…"/></div>` : ''}
      <button class="btn-primary" style="width:100%;padding:12px;" onclick="saveProfile()">💾 Save Profile</button>
    </div>`;
}

async function saveProfile() {
  const updates = {
    phone: document.getElementById('edit-phone')?.value.trim(),
    address: { area: document.getElementById('edit-area')?.value.trim(), city: currentUser.address?.city || 'Bhubaneswar' }
  };
  if (currentUser.role === 'worker') {
    updates.experience = document.getElementById('edit-exp')?.value;
    updates.currentJobTitle = document.getElementById('edit-jobtitle')?.value.trim();
    updates.skills = document.getElementById('edit-skills')?.value.split(',').map(s => s.trim()).filter(Boolean);
  }
  try {
    const res = await fetch(`${API}/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (data.success) {
      currentUser = { ...currentUser, ...updates };
      localStorage.setItem('kd_user', JSON.stringify(currentUser));
      showToast('✅ Profile saved!', false, true);
      renderProfile();
    }
  } catch (e) {
    currentUser = { ...currentUser, ...updates };
    localStorage.setItem('kd_user', JSON.stringify(currentUser));
    showToast('✅ Profile saved!', false, true);
    renderProfile();
  }
}

// ========== UTILITIES ==========
function showTab(tab) {
  document.querySelectorAll('.tab-panels > div').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById(`panel-${tab}`).classList.add('active');
  document.getElementById(`tab-${tab}`).classList.add('active');
  if (tab === 'profile') renderProfile();
  document.getElementById('post-error').style.display = 'none';
  document.getElementById('post-success').style.display = 'none';
}

function showToast(msg, err = false, success = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (err ? ' error' : success ? ' success' : '');
  t.style.display = 'block';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.display = 'none', 3500);
}