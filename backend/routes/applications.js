const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// POST /api/applications - Apply for a job
router.post('/', protect, async (req, res) => {
  try {
    const { jobId, applicantDetails } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (!job.isActive) return res.status(400).json({ success: false, message: 'This job is no longer active.' });
    if (job.workersHired >= job.workersNeeded) {
      return res.status(400).json({ success: false, message: 'All positions have been filled.' });
    }

    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied for this job.' });

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      applicantDetails: {
        name: applicantDetails.name || req.user.name,
        phone: applicantDetails.phone || req.user.phone,
        email: applicantDetails.email || req.user.email,
        address: applicantDetails.address,
        experience: applicantDetails.experience || req.user.experience,
        experienceYears: applicantDetails.experienceYears,
        currentJobTitle: applicantDetails.currentJobTitle,
        skills: applicantDetails.skills || req.user.skills,
        expectedPay: applicantDetails.expectedPay,
        availability: applicantDetails.availability || 'immediate',
        languages: applicantDetails.languages,
        education: applicantDetails.education,
        coverNote: applicantDetails.coverNote,
        hasOwnVehicle: applicantDetails.hasOwnVehicle,
        hasDrivingLicense: applicantDetails.hasDrivingLicense
      }
    });

    // Update job stats
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    res.status(201).json({
      success: true,
      message: `Successfully applied for "${job.title}"! The employer will contact you soon.`,
      application
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
    }
    res.status(500).json({ success: false, message: 'Error submitting application: ' + err.message });
  }
});

// GET /api/applications/my - Get my applications
router.get('/my', protect, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title category payPerDay location employerName icon isActive')
      .sort({ appliedAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching applications.' });
  }
});

// GET /api/applications/job/:jobId - Get applications for a job (employer)
router.get('/job/:jobId', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone')
      .sort({ appliedAt: -1 });
    res.json({ success: true, applications, total: applications.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching applications.' });
  }
});

// PATCH /api/applications/:id/status - Update application status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, employerNote } = req.body;
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    application.status = status;
    if (employerNote) application.employerNote = employerNote;
    application.updatedAt = new Date();
    await application.save();

    if (status === 'hired') {
      await Job.findByIdAndUpdate(application.job._id, { $inc: { workersHired: 1 } });
    }

    res.json({ success: true, message: 'Application status updated.', application });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating status.' });
  }
});

// DELETE /api/applications/:id - Withdraw application
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await Application.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Application withdrawn.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error withdrawing application.' });
  }
});

module.exports = router;
