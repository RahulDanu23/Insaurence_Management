import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, FileText, UploadCloud, CreditCard, Activity } from 'lucide-react';

const CustomerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [premiums, setPremiums] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Forms
  const [newClaim, setNewClaim] = useState({ policy_id: '', claim_amount: '', claim_reason: '' });
  const [claimMessage, setClaimMessage] = useState('');
  
  const [newDocument, setNewDocument] = useState({ document_type: '', file: null });
  const [docMessage, setDocMessage] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('https://insaurence-management.onrender.com/api/customers/get-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.profile);
      if(res.data.profile) {
        fetchPolicies();
        fetchClaims();
        fetchPremiums();
        fetchDocuments();
      }
    } catch (err) {
      console.log('Profile fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`https://insaurence-management.onrender.com/api/policies/my-policies`, { headers: { Authorization: `Bearer ${token}` } });
      setPolicies(res.data);
    } catch (err) {}
  };

  const fetchClaims = async () => {
    try {
      const res = await axios.get(`https://insaurence-management.onrender.com/api/claims/my-claims`, { headers: { Authorization: `Bearer ${token}` } });
      setClaims(res.data.claims || []);
    } catch (err) {}
  };

  const fetchPremiums = async () => {
    try {
      const res = await axios.get(`https://insaurence-management.onrender.com/api/premium/my-payments`, { headers: { Authorization: `Bearer ${token}` } });
      setPremiums(res.data.payments || []);
    } catch (err) {}
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`https://insaurence-management.onrender.com/api/documents/my-documents`, { headers: { Authorization: `Bearer ${token}` } });
      setDocuments(res.data.documents || []);
    } catch (err) {}
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    setClaimMessage('');
    try {
      await axios.post(`https://insaurence-management.onrender.com/api/claims/submit`, newClaim, { headers: { Authorization: `Bearer ${token}` } });
      setClaimMessage('Claim submitted successfully!');
      setNewClaim({ policy_id: '', claim_amount: '', claim_reason: '' });
      fetchClaims();
    } catch (err) {
      setClaimMessage(err.response?.data?.message || 'Error submitting claim');
    }
  };

  // Note: Customers cannot pay premiums directly in this system. Agents record payments.
  const handlePayPremium = async (id) => {
    // Deprecated client-side stub
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    setDocMessage('');
    if (!newDocument.file) {
      setDocMessage('Please select a file.');
      return;
    }
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('document_type', newDocument.document_type);
      formData.append('file', newDocument.file);

      await axios.post('https://insaurence-management.onrender.com/api/documents/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setDocMessage('Document uploaded successfully!');
      setNewDocument({ document_type: '', file: null });
      fetchDocuments();
    } catch (err) {
      setDocMessage(err.response?.data?.message || 'Error uploading document');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading) return <div className="text-slate-800 text-center mt-20">Loading Dashboard...</div>;

  const renderContent = () => {
    if (!profile) {
      return (
        <div className="text-center py-10">
          <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 mb-6">Your customer profile has not been created by an agent yet.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">My Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col items-center justify-center border-r-0 md:border-r border-slate-200 pr-0 md:pr-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-sky-100 rounded-full blur-md transform scale-110"></div>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0ea5e9&color=fff&size=256`} alt="Profile" className="relative w-48 h-48 rounded-full shadow-lg object-cover border-4 border-white" />
                </div>
                <h3 className="mt-6 text-2xl font-black text-slate-900">{profile.name}</h3>
                <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full mt-2 uppercase tracking-wide">Customer</span>
              </div>
              <div className="space-y-6 text-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1">Email Address</span>
                  <span className="text-lg font-bold">{profile.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1">Phone Number</span>
                  <span className="text-lg font-bold">{profile.phone}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1">Home Address</span>
                  <span className="text-lg font-bold">{profile.address}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1">Date of Birth</span>
                  <span className="text-lg font-bold">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not Provided'}</span>
                </div>
              </div>
            </div>
          </>
        );
      case 'policies':
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">My Policies</h2>
            {policies.length > 0 ? (
              <div className="space-y-4">
                {policies.map(p => {
                  const now = new Date();
                  const nextMonth = new Date();
                  nextMonth.setDate(now.getDate() + 30);
                  const endDate = new Date(p.policy_end_date);
                  
                  let renewalStatus = 'Active';
                  let statusColor = 'bg-emerald-100 text-emerald-700';
                  
                  if (endDate < now) {
                    renewalStatus = 'Expired';
                    statusColor = 'bg-rose-100 text-rose-700';
                  } else if (endDate < nextMonth) {
                    renewalStatus = 'Renewal Due';
                    statusColor = 'bg-amber-100 text-amber-700';
                  } else if (p.policy_status !== 'Active') {
                    renewalStatus = p.policy_status;
                    statusColor = 'bg-slate-100 text-slate-700';
                  }

                  return (
                    <div key={p._id} className="p-5 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50 shadow-sm">
                      <div>
                        <p className="font-bold text-slate-900">Policy: {p.policy_number}</p>
                        <p className="text-sm text-slate-500">Type: {p.policy_type} | Amount: ${p.policy_amount}</p>
                        <p className="text-sm text-slate-500">Valid: {new Date(p.policy_start_date).toLocaleDateString()} to {endDate.toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColor}`}>
                          {renewalStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">You do not have any active policies yet.</p>
              </div>
            )}
          </>
        );
      case 'premiums':
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment History</h2>
            {premiums.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {premiums.map(p => (
                  <div key={p._id} className="p-5 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50 shadow-sm">
                    <div>
                      <p className="font-bold text-slate-900">Amount: ${p.amount}</p>
                      <p className="text-sm text-slate-500">Date: {new Date(p.payment_date || p.createdAt).toLocaleDateString()}</p>
                      {p.policy_id && <p className="text-xs text-slate-400 mt-1">Policy: {p.policy_id.policy_number}</p>}
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">Paid</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">No payment records found.</p>
              </div>
            )}
          </>
        );
      case 'claims':
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">My Claims</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Submit New Claim</h3>
                {claimMessage && <p className="mb-4 text-sm font-medium text-sky-600 bg-sky-50 p-2 rounded">{claimMessage}</p>}
                <form onSubmit={handleCreateClaim} className="space-y-4">
                  <select required value={newClaim.policy_id} onChange={e => setNewClaim({...newClaim, policy_id: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                    <option value="">Select Policy</option>
                    {policies.filter(p => p.policy_status === 'Active').map(p => (
                      <option key={p._id} value={p._id}>{p.policy_number} - {p.policy_type} (${p.policy_amount})</option>
                    ))}
                  </select>
                  
                  {newClaim.policy_id && (() => {
                    const selectedPolicy = policies.find(p => p._id === newClaim.policy_id);
                    const approvedClaimAmount = claims
                      .filter(c => c.policy_id?._id === newClaim.policy_id && c.claim_status === 'Approved')
                      .reduce((acc, c) => acc + c.claim_amount, 0);
                    const remainingCoverage = selectedPolicy ? selectedPolicy.policy_amount - approvedClaimAmount : 0;
                    
                    return (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                        <div className="flex justify-between mb-1"><span className="text-slate-500">Total Coverage:</span><span className="font-bold">${selectedPolicy?.policy_amount}</span></div>
                        <div className="flex justify-between mb-1"><span className="text-slate-500">Approved Claims:</span><span className="font-bold text-rose-600">${approvedClaimAmount}</span></div>
                        <div className="flex justify-between pt-1 border-t border-slate-200"><span className="text-slate-700 font-bold">Remaining Claimable:</span><span className="font-bold text-emerald-600">${remainingCoverage}</span></div>
                      </div>
                    );
                  })()}

                  <input type="number" placeholder="Claim Amount ($)" required value={newClaim.claim_amount} onChange={e => setNewClaim({...newClaim, claim_amount: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
                  <textarea placeholder="Reason for claim (optional)..." value={newClaim.claim_reason} onChange={e => setNewClaim({...newClaim, claim_reason: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"></textarea>
                  <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg transition-colors">Submit Claim</button>
                </form>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Claim History</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {claims.map(c => (
                    <div key={c._id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-900">${c.claim_amount}</p>
                        <p className="text-sm text-slate-600 mt-1">{c.claim_reason}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${c.claim_status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : c.claim_status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.claim_status}
                      </span>
                    </div>
                  ))}
                  {claims.length === 0 && <p className="text-slate-500 text-sm">No claims submitted.</p>}
                </div>
              </div>
            </div>
          </>
        );
      case 'documents':
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">My Documents</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Upload Document</h3>
                {docMessage && <p className="mb-4 text-sm font-medium text-sky-600 bg-sky-50 p-2 rounded">{docMessage}</p>}
                <form onSubmit={handleUploadDocument} className="space-y-4">
                  <select required value={newDocument.document_type} onChange={e => setNewDocument({...newDocument, document_type: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                    <option value="">Select Document Type</option>
                    <option value="ID Proof">Adhar Card</option>
                    <option value="Address Proof">Pan Card</option>
                  </select>
                  <input type="file" required onChange={e => setNewDocument({...newDocument, file: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 border border-slate-300 rounded-lg p-1.5" />
                  <button type="submit" disabled={uploadingDoc} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg transition-colors">{uploadingDoc ? 'Uploading...' : 'Upload Document'}</button>
                </form>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Uploaded Documents</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {documents.map(d => (
                    <div key={d._id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">{d.document_type}</p>
                        <p className="text-sm text-slate-500">{d.file_name}</p>
                        <p className="text-xs text-slate-400 mt-1">Uploaded: {new Date(d.createdAt).toLocaleDateString()}</p>
                      </div>
                      <a href={`https://insaurence-management.onrender.com/${d.file_path}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-xs font-bold transition-colors">
                        View
                      </a>
                    </div>
                  ))}
                  {documents.length === 0 && <p className="text-slate-500 text-sm">No documents uploaded.</p>}
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black bg-gradient-to-r from-sky-600 to-violet-400 text-transparent bg-clip-text mb-8 inline-block">Customer Portal</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Menu */}
        <div className="md:col-span-1 space-y-2">
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors border ${activeTab === 'profile' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200'}`}>
            <User className="h-5 w-5" /> My Profile
          </button>
          <button onClick={() => setActiveTab('policies')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors border ${activeTab === 'policies' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200'}`}>
            <FileText className="h-5 w-5" /> My Policies
          </button>
          <button onClick={() => setActiveTab('premiums')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors border ${activeTab === 'premiums' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200'}`}>
            <CreditCard className="h-5 w-5" /> Premiums
          </button>
          <button onClick={() => setActiveTab('claims')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors border ${activeTab === 'claims' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200'}`}>
            <Activity className="h-5 w-5" /> Claims
          </button>
          <button onClick={() => setActiveTab('documents')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors border ${activeTab === 'documents' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200'}`}>
            <UploadCloud className="h-5 w-5" /> Documents
          </button>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm min-h-[500px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
