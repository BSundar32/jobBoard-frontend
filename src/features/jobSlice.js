import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosConfig';

const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const q = new URLSearchParams(params).toString();
    const res = await axios.get(`/api/jobs?${q}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchJobById = createAsyncThunk('jobs/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/jobs/${id}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyJobs = createAsyncThunk('jobs/fetchMine', async (token, { rejectWithValue }) => {
  try {
    const res = await axios.get('/api/jobs/myjobs', h(token));
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createJob = createAsyncThunk('jobs/create', async ({ data, token }, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/jobs', data, h(token));
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateJob = createAsyncThunk('jobs/update', async ({ id, data, token }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/api/jobs/${id}`, data, h(token));
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteJob = createAsyncThunk('jobs/delete', async ({ id, token }, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/jobs/${id}`, h(token));
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const jobSlice = createSlice({
  name: 'jobs',
  initialState: { items: [], myJobs: [], selected: null, loading: false, error: null },
  reducers: { clearSelected: (s) => { s.selected = null; } },
  extraReducers: (b) => {
    b.addCase(fetchJobs.pending, (s) => { s.loading = true; })
     .addCase(fetchJobs.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchJobs.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(fetchJobById.pending, (s) => { s.loading = true; s.selected = null; })
     .addCase(fetchJobById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
     .addCase(fetchMyJobs.fulfilled, (s, a) => { s.myJobs = a.payload; })
     .addCase(createJob.fulfilled, (s, a) => { s.myJobs.unshift(a.payload); s.items.unshift(a.payload); })
     .addCase(updateJob.fulfilled, (s, a) => {
       const i = s.myJobs.findIndex(j => j._id === a.payload._id);
       if (i !== -1) s.myJobs[i] = a.payload;
     })
     .addCase(deleteJob.fulfilled, (s, a) => {
       s.myJobs = s.myJobs.filter(j => j._id !== a.payload);
       s.items = s.items.filter(j => j._id !== a.payload);
     });
  },
});

export const { clearSelected } = jobSlice.actions;
export default jobSlice.reducer;
