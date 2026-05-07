import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../features/jobSlice';
import toast from 'react-hot-toast';
import './PostJob.css';

const BLANK = {
  title: '', company: '', location: '', type: 'Full-time', category: 'Engineering',
  description: '', requirements: '', skills: '', salaryMin: '', salaryMax: '', experience: 'Fresher',
};

export default function PostJob() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ ...BLANK, company: user?.company || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.description) { toast.error('Fill all required fields'); return; }
    try {
      setLoading(true);
      const data = {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        requirements: form.requirements.split('\n').filter(r => r.trim()),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      };
      await dispatch(createJob({ data, token: user.token })).unwrap();
      toast.success('Job posted successfully!');
      navigate('/my-jobs');
    } catch (err) {
      toast.error(err || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="page-wrap">
      <div className="container">
        <div className="post-job-wrap">
          <h1 className="page-title">Post a New Job</h1>

          <form className="card post-job-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="form-section-title">Basic Details</h3>
              <div className="form-row">
                <div className="form-group"><label>Job Title *</label><input placeholder="e.g. Frontend Developer" value={form.title} onChange={f('title')} /></div>
                <div className="form-group"><label>Company *</label><input placeholder="Company name" value={form.company} onChange={f('company')} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Location *</label><input placeholder="e.g. Chennai, India or Remote" value={form.location} onChange={f('location')} /></div>
                <div className="form-group">
                  <label>Job Type *</label>
                  <select value={form.type} onChange={f('type')}>
                    {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={f('category')}>
                    {['Engineering', 'Design', 'Product', 'DevOps', 'Marketing', 'Sales', 'HR', 'Finance', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Experience Level</label>
                  <select value={form.experience} onChange={f('experience')}>
                    {['Fresher', '1-2 years', '2-5 years', '5+ years'].map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Compensation</h3>
              <div className="form-row">
                <div className="form-group"><label>Min Salary (₹/year)</label><input type="number" placeholder="e.g. 600000" value={form.salaryMin} onChange={f('salaryMin')} /></div>
                <div className="form-group"><label>Max Salary (₹/year)</label><input type="number" placeholder="e.g. 1200000" value={form.salaryMax} onChange={f('salaryMax')} /></div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Job Details</h3>
              <div className="form-group">
                <label>Job Description *</label>
                <textarea rows={6} placeholder="Describe the role, responsibilities, team, and what makes this opportunity great..." value={form.description} onChange={f('description')} />
              </div>
              <div className="form-group">
                <label>Requirements (one per line)</label>
                <textarea rows={4} placeholder={"3+ years React.js\nStrong CSS skills\nTeam player"} value={form.requirements} onChange={f('requirements')} />
              </div>
              <div className="form-group">
                <label>Skills (comma separated)</label>
                <input placeholder="React.js, Node.js, MongoDB, Git" value={form.skills} onChange={f('skills')} />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
