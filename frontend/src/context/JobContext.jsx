import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

export const JobContext = createContext();

const SAMPLE_JOBS = [
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
  { id: 16, title: 'Civil Engineer (Site)', employer: 'Odisha Infrastructure Ltd', cat: 'engineering', pay: 2000, workers: 2, hired: 0, loc: 'Bhubaneswar', dist: '8.0 km', dur: '1 year', skills: ['B.Tech Civil', 'AutoCAD', 'Site Supervision', 'MS Project'], desc: 'Supervise residential project construction, ensure quality control and timeline adherence.', urgent: true, time: '3 hrs ago', phone: '9811223344', icon: '🔧' }
];

export const JobProvider = ({ children }) => {
  const { authToken } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortMode, setSortMode] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModalForJob, setShowApplyModalForJob] = useState(null);

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 3600) return Math.floor(diff / 60) + ' mins ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hrs ago';
    return Math.floor(diff / 86400) + ' days ago';
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getJobs(authToken);
      if (res.success && res.jobs && res.jobs.length > 0) {
        const mappedJobs = res.jobs.map(j => ({
          id: j._id,
          title: j.title,
          employer: j.employerName || 'Employer',
          cat: j.category,
          pay: j.payPerDay,
          workers: j.workersNeeded,
          hired: j.workersHired,
          loc: j.location?.area || 'Bhubaneswar',
          dist: (Math.random() * 8 + 0.5).toFixed(1) + ' km',
          dur: j.duration || 'Ongoing',
          skills: j.skills || [],
          desc: j.description,
          urgent: j.isUrgent,
          time: timeAgo(j.postedAt),
          phone: j.contactPhone,
          icon: j.icon || '💼',
          expRequired: j.experienceRequired
        }));
        setJobs(mappedJobs);
      } else {
        setJobs(SAMPLE_JOBS);
      }
    } catch (e) {
      console.error('Failed fetching jobs, falling back to sample data', e);
      setJobs(SAMPLE_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [authToken]);

  const postJob = async (payload) => {
    const isMock = !authToken || authToken.startsWith('demo') || authToken.startsWith('offline');
    if (isMock) {
      const mockJob = {
        id: 'mock_' + Date.now(),
        ...payload,
        pay: payload.payPerDay,
        workers: payload.workersNeeded,
        employer: 'You',
        hired: 0,
        dist: '0.5 km',
        time: 'Just now',
        loc: payload.location.area,
        phone: payload.contactPhone,
        urgent: payload.isUrgent
      };
      setJobs(prev => [mockJob, ...prev]);
      return { success: true, message: 'Job posted successfully (offline mode)!', job: mockJob };
    }

    try {
      const res = await api.postJob(authToken, payload);
      if (res.success) {
        loadJobs();
      }
      return res;
    } catch (err) {
      // Mock offline posting as fallback
      const mockJob = {
        id: 'mock_' + Date.now(),
        ...payload,
        pay: payload.payPerDay,
        workers: payload.workersNeeded,
        employer: 'You',
        hired: 0,
        dist: '0.5 km',
        time: 'Just now',
        loc: payload.location.area,
        phone: payload.contactPhone,
        urgent: payload.isUrgent
      };
      setJobs(prev => [mockJob, ...prev]);
      return { success: true, message: 'Job posted in offline mode!', job: mockJob };
    }
  };

  const applyForJob = async (jobId, applicantDetails) => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(jobId);
    const isMockToken = !authToken || authToken.startsWith('demo') || authToken.startsWith('offline');
    
    if (!isMongoId || isMockToken) {
      return { success: true, message: 'Applied successfully (offline fallback!)' };
    }

    try {
      const res = await api.submitApplication(authToken, { jobId, applicantDetails });
      return res;
    } catch (err) {
      return { success: true, message: 'Applied successfully (offline fallback)' };
    }
  };

  return (
    <JobContext.Provider value={{
      jobs,
      loading,
      activeFilter,
      setActiveFilter,
      sortMode,
      setSortMode,
      searchQuery,
      setSearchQuery,
      selectedJob,
      setSelectedJob,
      showApplyModalForJob,
      setShowApplyModalForJob,
      loadJobs,
      postJob,
      applyForJob
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => useContext(JobContext);
