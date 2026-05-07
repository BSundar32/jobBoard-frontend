import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchJobs } from '../../features/jobSlice';
import './Home.css';

const TYPE_COLORS = { 'Full-time': 'badge-blue', 'Remote': 'badge-teal', 'Contract': 'badge-orange', 'Internship': 'badge-green', 'Part-time': 'badge-gray' };

function JobCard({ job }) {
  const navigate = useNavigate();
  const salary = job.salaryMin && job.salaryMax
    ? `₹${(job.salaryMin / 100000).toFixed(1)}L – ₹${(job.salaryMax / 100000).toFixed(1)}L`
    : 'Salary not disclosed';

  return (
    <div className="job-card card" onClick={() => navigate(`/job/${job._id}`)}>
      <div className="job-card-top">
        <div className="company-avatar">{job.company.charAt(0)}</div>
        <div className="job-card-meta">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{job.company}</p>
        </div>
        <span className={`badge ${TYPE_COLORS[job.type] || 'badge-gray'}`}>{job.type}</span>
      </div>
      <div className="job-card-tags">
        <span className="job-tag">📍 {job.location}</span>
        <span className="job-tag">💼 {job.experience}</span>
        <span className="job-tag">💰 {salary}</span>
      </div>
      <div className="job-skills">
        {job.skills?.slice(0, 4).map(s => <span key={s} className="skill-tag">{s}</span>)}
      </div>
      <div className="job-card-footer">
        <span className="job-category">{job.category}</span>
        <span className="job-applicants">{job.applicantsCount} applicants</span>
      </div>
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.jobs);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};
      if (search) params.search = search;
      if (type) params.type = type;
      if (category) params.category = category;
      if (experience) params.experience = experience;
      dispatch(fetchJobs(params));
    }, 350);
    return () => clearTimeout(timer);
  }, [dispatch, search, type, category, experience]);

  const clearFilters = () => { setSearch(''); setType(''); setCategory(''); setExperience(''); };

  return (
    <div className="page-wrap">
      <div className="container">
        {/* Hero */}
        <div className="home-hero">
          <h1>Find Your <span>Dream Job</span></h1>
          <p>Browse hundreds of opportunities from top companies. Apply in minutes.</p>
          <div className="hero-search">
            <input
              type="text"
              placeholder="Search by title, company or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="hero-stats">
            <span>🏢 {items.length} Jobs Available</span>
            <span>🚀 New jobs added daily</span>
          </div>
        </div>

        <div className="home-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <div className="filter-header">
              <h3>Filters</h3>
              <button className="clear-btn" onClick={clearFilters}>Clear all</button>
            </div>

            <div className="filter-section">
              <label>Job Type</label>
              {['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'].map(t => (
                <label key={t} className="filter-check">
                  <input type="radio" name="type" checked={type === t} onChange={() => setType(type === t ? '' : t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <label>Category</label>
              {['Engineering', 'Design', 'Product', 'DevOps', 'Marketing', 'Sales'].map(c => (
                <label key={c} className="filter-check">
                  <input type="radio" name="category" checked={category === c} onChange={() => setCategory(category === c ? '' : c)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <label>Experience</label>
              {['Fresher', '1-2 years', '2-5 years', '5+ years'].map(e => (
                <label key={e} className="filter-check">
                  <input type="radio" name="exp" checked={experience === e} onChange={() => setExperience(experience === e ? '' : e)} />
                  <span>{e}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* Jobs Grid */}
          <div className="jobs-section">
            <div className="jobs-header">
              <p className="jobs-count">{items.length} jobs found</p>
            </div>
            {loading ? (
              <div className="spinner" />
            ) : items.length === 0 ? (
              <div className="empty-jobs">
                <p>No jobs match your filters.</p>
                <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="jobs-list">
                {items.map(job => <JobCard key={job._id} job={job} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
