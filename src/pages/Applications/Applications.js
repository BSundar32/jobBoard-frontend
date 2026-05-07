import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import './Applications.css';

const STATUS_COLORS = { Pending: 'badge-gray', Reviewed: 'badge-blue', Shortlisted: 'badge-teal', Rejected: 'badge-red', Hired: 'badge-green' };
const STATUS_LABEL = { Pending: 'Under Review', Reviewed: 'Reviewed', Shortlisted: '🌟 Shortlisted', Rejected: 'Not Selected', Hired: '🎉 Hired!' };

export default function Applications() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/applications/my', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => setApplications(res.data))
      .finally(() => setLoading(false));
  }, [user.token]);

  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 className="page-title">My Applications</h1>
        <p className="apps-sub">{applications.length} total applications</p>

        {applications.length === 0 ? (
          <div className="empty-apps">
            <div className="empty-icon">📋</div>
            <h3>No applications yet</h3>
            <p>Browse jobs and apply to get started.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Jobs</button>
          </div>
        ) : (
          <div className="apps-list">
            {applications.map(app => (
              <div key={app._id} className="app-card card">
                <div className="app-card-left">
                  <div className="app-company-avatar">{app.job?.company?.charAt(0) || '?'}</div>
                  <div className="app-info">
                    <h3 className="app-job-title">{app.job?.title || 'Job no longer available'}</h3>
                    <p className="app-company">{app.job?.company}</p>
                    <div className="app-meta">
                      {app.job?.location && <span>📍 {app.job.location}</span>}
                      {app.job?.type && <span className={`badge ${app.job.type === 'Remote' ? 'badge-teal' : 'badge-blue'}`}>{app.job.type}</span>}
                    </div>
                  </div>
                </div>

                <div className="app-card-right">
                  <div className="app-status-block">
                    <span className={`badge ${STATUS_COLORS[app.status]}`}>{STATUS_LABEL[app.status] || app.status}</span>
                    <p className="app-date">Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  {app.job?._id && (
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/job/${app.job._id}`)}>View Job</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
