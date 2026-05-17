const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, optionalAuth } = require('../middleware/auth');

// GET /api/jobs - Get all jobs with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, city, sort, page = 1, limit = 20, urgent } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (urgent === 'true') query.isUrgent = true;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.area': new RegExp(search, 'i') },
        { skills: new RegExp(search, 'i') }
      ];
    }

    let sortObj = { postedAt: -1 };
    if (sort === 'pay') sortObj = { payPerDay: -1 };
    else if (sort === 'urgent') sortObj = { isUrgent: -1, postedAt: -1 };

    const jobs = await Job.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('employer', 'name companyName');

    const total = await Job.countDocuments(query);

    res.json({ success: true, jobs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching jobs.' });
  }
});

// GET /api/jobs/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name companyName phone');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    job.views += 1;
    await job.save({ validateBeforeSave: false });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching job.' });
  }
});

// POST /api/jobs - Create job (employer only)
router.post('/', protect, async (req, res) => {
  try {
    const jobData = { ...req.body, employer: req.user._id, employerName: req.user.companyName || req.user.name };
    const job = await Job.create(jobData);
    res.status(201).json({ success: true, message: 'Job posted successfully!', job });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Error posting job.' });
  }
});

// PUT /api/jobs/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    const updated = await Job.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    res.json({ success: true, message: 'Job updated.', job: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating job.' });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await Job.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Job removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing job.' });
  }
});

// Seed sample jobs
router.post('/seed/sample', async (req, res) => {
  try {
    const sampleJobs = [
      { title: 'Construction Helper', category: 'construction', employerName: 'Patel Builders', payPerDay: 550, workersNeeded: 5, workersHired: 2, location: { area: 'Saheed Nagar', city: 'Bhubaneswar' }, skills: ['Heavy Lifting', 'Basic Tools'], description: 'Need helpers for concrete pouring and material carrying. 8AM–6PM. Safety equipment provided.', isUrgent: true, contactPhone: '9876543210', icon: '🏗️', employer: req.body.employerId || '000000000000000000000001', duration: '2 weeks' },
      { title: 'House Cleaner', category: 'cleaning', employerName: 'Mrs. Sharma', payPerDay: 400, workersNeeded: 1, workersHired: 0, location: { area: 'Patia', city: 'Bhubaneswar' }, skills: ['No skill needed'], description: 'Full house cleaning for 3BHK. 9AM start.', isUrgent: false, contactPhone: '9812345678', icon: '🧹', employer: req.body.employerId || '000000000000000000000001', duration: '1 day' },
      { title: 'Delivery Rider (Bike)', category: 'delivery', employerName: 'QuickMart', payPerDay: 600, workersNeeded: 3, workersHired: 1, location: { area: 'Khandagiri', city: 'Bhubaneswar' }, skills: ['Driving', 'Own Bike'], description: '2-wheeler delivery. Must have own bike and DL.', isUrgent: true, contactPhone: '9988776655', icon: '🚚', employer: req.body.employerId || '000000000000000000000001', duration: 'Ongoing' },
      { title: 'Security Guard', category: 'security', employerName: 'Infocity Mall', payPerDay: 500, workersNeeded: 2, workersHired: 2, location: { area: 'Infocity', city: 'Bhubaneswar' }, skills: ['Security Training'], description: 'Night shift 10PM–6AM. Uniform provided.', isUrgent: false, contactPhone: '9123456780', icon: '🔒', employer: req.body.employerId || '000000000000000000000001', duration: '1 month' },
      { title: 'Software Developer (React)', category: 'it_tech', employerName: 'TechVenture Pvt Ltd', payPerDay: 2500, workersNeeded: 2, workersHired: 0, location: { area: 'Infocity', city: 'Bhubaneswar' }, skills: ['React', 'JavaScript', 'Node.js'], description: 'Build web applications for e-commerce startup. Remote or on-site.', isUrgent: true, contactPhone: '9876001234', icon: '💻', employer: req.body.employerId || '000000000000000000000001', duration: '3 months', experienceRequired: '1_to_3' },
      { title: 'Hospital Nurse (GNM)', category: 'healthcare', employerName: 'Apollo Clinic Bhubaneswar', payPerDay: 1200, workersNeeded: 3, workersHired: 1, location: { area: 'Chandrasekharpur', city: 'Bhubaneswar' }, skills: ['GNM/ANM Degree', 'Patient Care', 'IV Administration'], description: 'General nursing duties in medicine ward. Day/Night shifts available.', isUrgent: true, contactPhone: '9800012345', icon: '🏥', employer: req.body.employerId || '000000000000000000000001', duration: 'Permanent' },
      { title: 'Accounts Manager', category: 'finance', employerName: 'Reliance Traders', payPerDay: 1800, workersNeeded: 1, workersHired: 0, location: { area: 'Nayapalli', city: 'Bhubaneswar' }, skills: ['Tally', 'MS Excel', 'GST Filing'], description: 'Manage day-to-day accounts, GST filing, and financial reporting.', isUrgent: false, contactPhone: '9898001122', icon: '📊', employer: req.body.employerId || '000000000000000000000001', duration: 'Permanent' },
      { title: 'Graphic Designer', category: 'design', employerName: 'Creative Studio Odisha', payPerDay: 1500, workersNeeded: 2, workersHired: 0, location: { area: 'Saheed Nagar', city: 'Bhubaneswar' }, skills: ['Photoshop', 'Illustrator', 'Canva'], description: 'Create social media content, branding materials, and digital ads.', isUrgent: false, contactPhone: '9900112233', icon: '🎨', employer: req.body.employerId || '000000000000000000000001', duration: '6 months' },
      { title: 'Primary School Teacher', category: 'education', employerName: 'Saraswati Vidya Mandir', payPerDay: 900, workersNeeded: 2, workersHired: 1, location: { area: 'Unit-9', city: 'Bhubaneswar' }, skills: ['B.Ed', 'English', 'Math'], description: 'Teach Maths and English for classes 1-5. Morning shift 7AM-12PM.', isUrgent: false, contactPhone: '9776543210', icon: '📚', employer: req.body.employerId || '000000000000000000000001', duration: 'Academic year' },
      { title: 'Hotel Receptionist', category: 'hospitality', employerName: 'Swosti Grand Hotel', payPerDay: 700, workersNeeded: 2, workersHired: 0, location: { area: 'Janpath', city: 'Bhubaneswar' }, skills: ['Communication', 'Computer Basics', 'English'], description: 'Handle hotel check-ins, reservations and guest services. Presentable personality required.', isUrgent: false, contactPhone: '9654321098', icon: '🏨', employer: req.body.employerId || '000000000000000000000001', duration: 'Permanent' },
      { title: 'Digital Marketing Executive', category: 'marketing', employerName: 'GrowFast Digital', payPerDay: 1300, workersNeeded: 1, workersHired: 0, location: { area: 'Patia', city: 'Bhubaneswar' }, skills: ['SEO', 'Social Media', 'Google Ads', 'Content Writing'], description: 'Manage social media accounts, run paid campaigns, and create content strategy.', isUrgent: false, contactPhone: '9090901234', icon: '📱', employer: req.body.employerId || '000000000000000000000001', duration: 'Permanent' },
      { title: 'Warehouse Supervisor', category: 'logistics', employerName: 'Amazon Delivery Hub', payPerDay: 1000, workersNeeded: 4, workersHired: 2, location: { area: 'Rasulgarh', city: 'Bhubaneswar' }, skills: ['Inventory Management', 'Team Leadership'], description: 'Manage warehouse operations, track inventory, oversee loading team.', isUrgent: true, contactPhone: '9012345678', icon: '📦', employer: req.body.employerId || '000000000000000000000001', duration: 'Permanent' },
    ];
    await Job.deleteMany({});
    const inserted = await Job.insertMany(sampleJobs);
    res.json({ success: true, message: `${inserted.length} sample jobs seeded.`, count: inserted.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Seed error: ' + err.message });
  }
});

module.exports = router;
