import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById, clearSelected } from '../../features/jobSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import './JobDetail.css';

const TYPE_COLORS = { 'Full-time': 'badge-blue', 'Remote': 'badge-teal', 'Contract': 'badge-orange', 'Internship': 'badge-green', 'Part-time': 'badge-gray' };

export default function JobDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: job, loading } = useSelector(s => s.jobs);
  const { user } = useSelector(s => s.auth);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    dispatch(fetchJobById(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to apply'); navigate('/login'); return; }
    try {
      setApplying(true);
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      if (resume) formData.append('resume', resume);

      await axios.post(`/api/applications/job/${id}`, formData, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' },
      });
      setApplied(true);
      setShowApply(false);
      toast.success('Application submitted successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;
  if (!job) return <div className="page-wrap"><div className="container"><p style={{ color: 'var(--muted)', marginTop: '3rem' }}>Job not found.</p></div></div>;

  const salary = job.salaryMin && job.salaryMax
    ? `₹${(job.salaryMin / 100000).toFixed(1)}L – ₹${(job.salaryMax / 100000).toFixed(1)}L per year`
    : 'Salary not disclosed';

  const isEmployer = user?.role === 'employer' || user?.role === 'admin';

  return (
    <div className="page-wrap">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to Jobs</button>

        <div className="detail-layout">
          {/* Main Content */}
          <div className="detail-main">
            <div className="card detail-header-card">
              <div className="detail-top">
                <div className="company-avatar-lg">{job.company.charAt(0)}</div>
                <div className="detail-title-group">
                  <h1 className="detail-job-title">{job.title}</h1>
                  <p className="detail-company">{job.company}</p>
                  <div className="detail-badges">
                    <span className={`badge ${TYPE_COLORS[job.type] || 'badge-gray'}`}>{job.type}</span>
                    <span className="badge badge-gray">{job.category}</span>
                    <span className="badge badge-gray">{job.experience}</span>
                  </div>
                </div>
              </div>

              <div className="detail-info-row">
                <div className="info-item"><span className="info-icon">📍</span><span>{job.location}</span></div>
                <div className="info-item"><span className="info-icon">💰</span><span>{salary}</span></div>
                <div className="info-item"><span className="info-icon">👥</span><span>{job.applicantsCount} applicants</span></div>
                <div className="info-item"><span className="info-icon">📅</span><span>{new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
              </div>
            </div>

            <div className="card detail-section-card">
              <h3>Job Description</h3>
              <p>{job.description}</p>
            </div>

            {job.requirements?.length > 0 && (
              <div className="card detail-section-card">
                <h3>Requirements</h3>
                <ul className="req-list">
                  {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {job.skills?.length > 0 && (
              <div className="card detail-section-card">
                <h3>Skills Required</h3>
                <div className="skills-wrap">
                  {job.skills.map(s => <span key={s} className="skill-tag-lg">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Apply Card */}
          <aside className="detail-sidebar">
            <div className="card apply-card">
              <h3>Interested in this role?</h3>
              <p>Posted by {job.postedBy?.name} from {job.company}</p>

              {!isEmployer && (
                applied ? (
                  <div className="applied-banner">✓ Application Submitted</div>
                ) : showApply ? (
                  <form onSubmit={handleApply} className="apply-form">
                    <div className="form-group">
                      <label>Cover Letter</label>
                      <textarea rows={5} placeholder="Tell us why you're a great fit..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Resume (PDF/DOC)</label>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} style={{ padding: '0.4rem', fontSize: '0.82rem' }} />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={applying}>
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setShowApply(false)}>Cancel</button>
                  </form>
                ) : (
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={() => { if (!user) { toast.error('Login to apply'); navigate('/login'); } else setShowApply(true); }}
                  >
                    Apply Now
                  </button>
                )
              )}

              {isEmployer && <p className="employer-note">You are viewing as an employer.</p>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
