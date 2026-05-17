const categoryMap = {
  'it-jobs': 'it_tech',
  'engineering-jobs': 'engineering',
  'healthcare-nursing-jobs': 'healthcare',
  'teaching-jobs': 'education',
  'accounting-finance-jobs': 'finance',
  'sales-jobs': 'marketing',
  'admin-jobs': 'admin',
  'creative-design-jobs': 'design',
  'legal-jobs': 'legal',
  'hotel-catering-jobs': 'hospitality',
  'logistics-warehouse-jobs': 'logistics',
  'trade-construction-jobs': 'construction',
  'cleaning-jobs': 'cleaning',
  'domestic-jobs': 'domestic',
  'security-jobs': 'security',
  'social-work-jobs': 'healthcare'
};

const categoryIcons = {
  construction: '🏗️',
  cleaning: '🧹',
  delivery: '🚚',
  domestic: '🏠',
  agriculture: '🌾',
  security: '🔒',
  loading: '📦',
  it_tech: '💻',
  healthcare: '🏥',
  education: '📚',
  retail: '🛍️',
  hospitality: '🏨',
  manufacturing: '🏭',
  logistics: '📦',
  finance: '📊',
  marketing: '📱',
  legal: '⚖️',
  engineering: '🔧',
  design: '🎨',
  admin: '💼',
  driver: '🚗',
  other: '💼'
};

const categoryWages = {
  construction: { min: 450, max: 700 },
  cleaning: { min: 350, max: 550 },
  delivery: { min: 400, max: 650 },
  domestic: { min: 350, max: 600 },
  agriculture: { min: 300, max: 500 },
  security: { min: 400, max: 700 },
  loading: { min: 400, max: 650 },
  it_tech: { min: 1800, max: 4000 },
  healthcare: { min: 1000, max: 2500 },
  education: { min: 700, max: 1800 },
  retail: { min: 400, max: 800 },
  hospitality: { min: 500, max: 1200 },
  manufacturing: { min: 450, max: 850 },
  logistics: { min: 500, max: 950 },
  finance: { min: 1200, max: 3000 },
  marketing: { min: 900, max: 2500 },
  legal: { min: 1000, max: 2800 },
  engineering: { min: 1200, max: 3200 },
  design: { min: 800, max: 2200 },
  admin: { min: 600, max: 1500 },
  driver: { min: 500, max: 900 },
  other: { min: 400, max: 900 }
};

function detectCategory(title, description, adzunaCategory) {
  const t = `${title} ${description || ''}`.toLowerCase();
  
  if (adzunaCategory && categoryMap[adzunaCategory]) {
    return categoryMap[adzunaCategory];
  }
  
  if (t.includes('driver') || t.includes('chauffeur') || t.includes('cab') || t.includes('truck')) return 'driver';
  if (t.includes('delivery') || t.includes('rider') || t.includes('courier')) return 'delivery';
  if (t.includes('farm') || t.includes('agriculture') || t.includes('harvest') || t.includes('garden') || t.includes('nursery')) return 'agriculture';
  if (t.includes('construction') || t.includes('builder') || t.includes('mason') || t.includes('carpenter') || t.includes('plumber') || t.includes('electrician') || t.includes('painter')) return 'construction';
  if (t.includes('clean') || t.includes('sweeper') || t.includes('laundry') || t.includes('housekeep') || t.includes('maid')) return 'cleaning';
  if (t.includes('cook') || t.includes('chef') || t.includes('maid') || t.includes('domestic') || t.includes('home help')) return 'domestic';
  if (t.includes('security') || t.includes('guard') || t.includes('watchman') || t.includes('patrol')) return 'security';
  if (t.includes('nurse') || t.includes('doctor') || t.includes('hospital') || t.includes('clinic') || t.includes('medical') || t.includes('pharma')) return 'healthcare';
  if (t.includes('teacher') || t.includes('tutor') || t.includes('school') || t.includes('education') || t.includes('professor')) return 'education';
  if (t.includes('program') || t.includes('software') || t.includes('developer') || t.includes('react') || t.includes('node') || t.includes('tech') || t.includes('it analyst')) return 'it_tech';
  if (t.includes('loader') || t.includes('warehouse') || t.includes('unloading') || t.includes('helper') || t.includes('packer')) return 'loading';
  if (t.includes('accounting') || t.includes('finance') || t.includes('tax') || t.includes('bank') || t.includes('tally')) return 'finance';
  if (t.includes('design') || t.includes('graphic') || t.includes('artist') || t.includes('ux') || t.includes('ui')) return 'design';
  if (t.includes('marketing') || t.includes('seo') || t.includes('sales') || t.includes('ads') || t.includes('digital market')) return 'marketing';
  if (t.includes('law') || t.includes('legal') || t.includes('advocate') || t.includes('counsel') || t.includes('lawyer')) return 'legal';
  if (t.includes('receptionist') || t.includes('hotel') || t.includes('waiter') || t.includes('steward') || t.includes('front desk')) return 'hospitality';
  
  return 'other';
}

function cleanDescription(htmlDesc) {
  if (!htmlDesc) return 'No description provided.';
  return htmlDesc
    .replace(/<\/?[^>]+(>|$)/g, '') // Strip HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetches real-time jobs from Adzuna API
 * @param {Object} filters { query, location }
 * @returns {Promise<Array>} Normalized job objects
 */
async function fetchAdzunaJobs({ query = '', location = '' }) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;

  if (!appId || !appKey) {
    console.log('💡 Adzuna API credentials not configured. Skipping active API fetch.');
    return [];
  }

  try {
    const what = encodeURIComponent(query || 'helper');
    const where = encodeURIComponent(location || 'Bhubaneswar');
    
    // Country code 'in' represents India
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=15&what=${what}&where=${where}&content-type=application/json`;

    console.log(`🌐 Calling Adzuna API: ${url.replace(appKey, '***')}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !data.results) {
      return [];
    }

    return data.results.map(j => {
      const cat = detectCategory(j.title, j.description, j.category?.tag);
      const icon = categoryIcons[cat] || '💼';
      const cleanDesc = cleanDescription(j.description);

      // Daily wage calculation: annual salary / 300
      let pay = 0;
      if (j.salary_min) {
        pay = Math.round(j.salary_min / 300);
      } else if (j.salary_max) {
        pay = Math.round(j.salary_max / 300);
      }

      // localized pay safety fallback
      const wages = categoryWages[cat] || categoryWages.other;
      if (pay < wages.min || pay > wages.max * 1.5) {
        pay = Math.floor(Math.random() * (wages.max - wages.min + 1)) + wages.min;
      }

      // Standardizing location
      const area = j.location?.area?.[j.location.area.length - 1] || j.location?.display_name || 'Bhubaneswar';
      
      // Skills parsing
      const skills = [];
      if (cat === 'it_tech') skills.push('JavaScript', 'Software Development');
      else if (cat === 'construction') skills.push('Hard Working', 'Safety Gear');
      else if (cat === 'cleaning') skills.push('Tidy', 'Basic Cleaning');
      else if (cat === 'healthcare') skills.push('Patient Care', 'Medical Knowledge');
      else skills.push('Communication', 'Reliable');

      return {
        adzunaId: j.id,
        title: j.title,
        category: cat,
        employerName: j.company?.display_name || 'Aggregated Partner',
        description: cleanDesc,
        skills,
        workersNeeded: Math.floor(Math.random() * 4) + 1,
        workersHired: 0,
        payPerDay: pay,
        location: {
          area,
          city: location || 'Bhubaneswar',
          district: 'Khordha',
          state: 'Odisha'
        },
        duration: 'Ongoing',
        contactPhone: '9876543210',
        isUrgent: Math.random() > 0.6,
        icon,
        experienceRequired: 'none',
        postedAt: new Date(j.created)
      };
    });
  } catch (err) {
    console.error('❌ Adzuna API Fetch failed:', err.message);
    return [];
  }
}

module.exports = {
  fetchAdzunaJobs
};
