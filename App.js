import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://cryptocard-exchange-backend.onrender.com';

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('admin_token')||'');
  const [redemptions, setRedemptions] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const saveToken = (t) => { setToken(t); localStorage.setItem('admin_token', t); }

  const loadRedemptions = async () => {
    if (!token) return alert('Paste admin JWT token first');
    setLoading(true);
    try{
      const r = await axios.get(`${API_BASE}/api/admin/redemptions/pending`, { headers });
      setRedemptions(r.data.redemptions || []);
    }catch(e){ alert('Failed to load redemptions: ' + (e.response?.data?.error || e.message)); }
    setLoading(false);
  };

  const loadMerchants = async () => {
    if (!token) return alert('Paste admin JWT token first');
    setLoading(true);
    try{
      const r = await axios.get(`${API_BASE}/api/admin/merchants/pending`, { headers });
      setMerchants(r.data.merchants || []);
    }catch(e){ alert('Failed to load merchants: ' + (e.response?.data?.error || e.message)); }
    setLoading(false);
  };

  const approveRedemption = async (id) => {
    const sats = parseInt(prompt('Sats to credit (integer)'), 10);
    if (!sats) return alert('Invalid sats');
    setLoading(true);
    try{
      await axios.post(`${API_BASE}/api/admin/redemptions/${id}/approve`, { sats, notes: 'Approved via admin UI' }, { headers });
      alert('Approved');
      loadRedemptions();
    }catch(e){ alert('Approve failed: ' + (e.response?.data?.error || e.message)); }
    setLoading(false);
  };

  const rejectRedemption = async (id) => {
    const notes = prompt('Rejection notes (optional)', 'Invalid/duplicate');
    setLoading(true);
    try{
      await axios.post(`${API_BASE}/api/admin/redemptions/${id}/reject`, { notes }, { headers });
      alert('Rejected');
      loadRedemptions();
    }catch(e){ alert('Reject failed: ' + (e.response?.data?.error || e.message)); }
    setLoading(false);
  };

  const approveMerchant = async (id) => {
    setLoading(true);
    try{
      await axios.post(`${API_BASE}/api/admin/merchants/${id}/approve`, {}, { headers });
      alert('Merchant approved');
      loadMerchants();
    }catch(e){ alert('Approve merchant failed: ' + (e.response?.data?.error || e.message)); }
    setLoading(false);
  };

  const rejectMerchant = async (id) => {
    setLoading(true);
    try{
      await axios.post(`${API_BASE}/api/admin/merchants/${id}/reject`, {}, { headers });
      alert('Merchant rejected');
      loadMerchants();
    }catch(e){ alert('Reject merchant failed: ' + (e.response?.data?.error || e.message)); }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="header">
        <h2>CryptoCard Exchange — Admin</h2>
        <div>
          <button className="btn smallBtn" onClick={() => { localStorage.removeItem('admin_token'); setToken(''); setRedemptions([]); setMerchants([]);}}>Logout</button>
        </div>
      </div>

      <div className="card">
        <div className="field">
          <label>Admin JWT Token</label>
          <div className="tokenBox">
            <input placeholder="Paste admin JWT token here" value={token} onChange={(e)=>saveToken(e.target.value)} />
            <button className="btn smallBtn" onClick={()=>{ loadRedemptions(); loadMerchants(); }}>Load Data</button>
          </div>
        </div>
        <div style={{marginTop:8}}>
          <small>Note: Admin token must belong to an email listed in ADMIN_EMAILS on server.</small>
        </div>
      </div>

      <div style={{marginTop:16}}>
        <h3>Pending Redemptions</h3>
        {loading && <div>Loading…</div>}
        {redemptions.length===0 && <div className="card">No pending redemptions</div>}
        {redemptions.map(r => (
          <div key={r._id} className="card">
            <div className="row">
              <div>
                <div><strong>ID:</strong> {r._id}</div>
                <div><strong>User:</strong> {r.user_id}</div>
                <div><strong>Amount (cents):</strong> {r.claimed_value_cents}</div>
                <div><strong>Status:</strong> {r.status}</div>
                <div><strong>Created:</strong> {new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="right">
                <div className="flex">
                  <button className="btn smallBtn" onClick={()=>approveRedemption(r._id)}>Approve</button>
                  <button className="btn smallBtn" style={{background:'#e85a5a'}} onClick={()=>rejectRedemption(r._id)}>Reject</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:16}}>
        <h3>Pending Merchants</h3>
        {merchants.length===0 && <div className="card">No pending merchants</div>}
        {merchants.map(m => (
          <div key={m._id} className="card">
            <div className="row">
              <div>
                <div><strong>Business:</strong> {m.business_name}</div>
                <div><strong>Email:</strong> {m.email}</div>
                <div><strong>Country:</strong> {m.country}</div>
                <div><strong>Created:</strong> {new Date(m.created_at).toLocaleString()}</div>
              </div>
              <div className="right">
                <div className="flex">
                  <button className="btn smallBtn" onClick={()=>approveMerchant(m._id)}>Approve</button>
                  <button className="btn smallBtn" style={{background:'#e85a5a'}} onClick={()=>rejectMerchant(m._id)}>Reject</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:24, textAlign:'center', color:'#666'}}>Built for CryptoCard Exchange • Ghana & Nigeria</div>
    </div>
  );
}
