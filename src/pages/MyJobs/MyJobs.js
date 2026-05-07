import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyJobs, deleteJob } from '../../features/jobSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import './MyJobs.css';

const STATUS_COLORS = { Pending: 'badge-gray', Reviewed: 'badge-blue', Shortlisted: 'badge-teal', Rejected: 'badge-red', Hired: 'badge-green' };

export default function MyJobs() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { myJobs, loading } = useSelector(s => s.jobs);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyJobs(user.token));
  }, [dispatch, user.token]);

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setAppsLoading(true);
    try {
      const res = await axios.get(`/api/applications/job/${job._id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      setApplications(res.data);
    } catch { toast.error('Failed to load applications'); }
    finally { setAppsLoading(false); }
  };

  const handleStatusUpdate = async (appId, status) => {
    try {
      await axios.put(`/api/applications/${appId}/status`, { status }, { headers: { Authorization: `Bearer ${user.token}` } });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this job posting?')) {
      dispatch(deleteJob({ id, token: user.token }));
      toast.success('Job deleted');
      if (selectedJob?._id === id) setSelectedJob(null);
    }
  };

  const handleToggle = async (job) => {
    try {
      await axios.put(`/api/jobs/${job._id}`, { isActive: !job.isActive }, { headers: { Authorization: `Bearer ${user.token}` } });
      dispatch(fetchMyJobs(user.token));
      toast.success(job.isActive ? 'Job closed' : 'Job reopened');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 className="page-title">My Job Postings</h1>

        {loading ? <div className="spinner" /> : myJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
            <p style={{ marginBottom: '1rem' }}>You haven't posted any jobs yet.</p>
          </div>
        ) : (
          <div className="myjobs-layout">
            {/* Jobs List */}
            <div className="myjobs-list">
              {myJobs.map(job => (
                <div
                  key={job._id}
                  className={`myjob-card card ${selectedJob?._id === job._id ? 'active' : ''}`}
                  onClick={() => handleViewApplicants(job)}
                >
                  <div className="myjob-top">
                    <div>
                      <h3 className="myjob-title">{job.title}</h3>
                      <p className="myjob-meta">{job.location} · {job.type}</p>
                    </div>
                    <span className={`badge ${job.isActive ? 'badge-green' : 'badge-gray'}`}>
                      {job.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  <div className="myjob-stats">
                    <span>👥 {job.applicantsCount} applicants</span>
                    <span>📅 {new Date(job.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="myjob-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-outline btn-sm" onClick={() => handleToggle(job)}>
                      {job.isActive ? 'Close' : 'Reopen'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Applicants Panel */}
            <div className="applicants-panel card">
              {!selectedJob ? (
                <div className="no-selection">
                  <p>← Click a job to view applicants</p>
                </div>
              ) : (
                <>
                  <div className="panel-header">
                    <h3>{selectedJob.title}</h3>
                    <span className="panel-count">{applications.length} applicants</span>
                  </div>
                  {appsLoading ? <div className="spinner" /> : applications.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No applications yet</p>
                  ) : (
                    <div className="applicants-list">
                      {applications.map(app => (
                        <div key={app._id} className="applicant-card">
                          <div className="applicant-avatar">{app.applicant?.name?.charAt(0)}</div>
                          <div className="applicant-info">
                            <p className="applicant-name">{app.applicant?.name}</p>
                            <p className="applicant-email">{app.applicant?.email}</p>
                            {app.coverLetter && <p className="applicant-cl">{app.coverLetter.slice(0, 100)}...</p>}
                            {app.resumeUrl && <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="resume-link">📄 View Resume</a>}
                          </div>
                          <div className="applicant-status">
                            <select
                              className="status-select"
                              value={app.status}
                              onChange={e => handleStatusUpdate(app._id, e.target.value)}
                            >
                              {['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'].map(s => <option key={s}>{s}</option>)}
                            </select>
                            <span className={`badge ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
