import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Users, FileText, Activity, DollarSign, ArrowLeft } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data lists
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Forms
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', password: '', phone: '', dob: '', address: '', profile_picture: null });
  const [customerMessage, setCustomerMessage] = useState('');
  
  const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '', role: 'Agent' });
  const [agentMessage, setAgentMessage] = useState('');

  const [newPolicy, setNewPolicy] = useState({ customer_id: '', policy_number: '', policy_type: 'Health', policy_amount: '', policy_start_date: '', policy_end_date: '', policy_status: 'Active' });
  const [policyMessage, setPolicyMessage] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [customersRes, policiesRes, claimsRes, premiumsRes] = await Promise.all([
        axios.get('https://insaurence-management.onrender.com/api/reports/total-customers', { headers }),
        axios.get('https://insaurence-management.onrender.com/api/reports/active-policies', { headers }),
        axios.get('https://insaurence-management.onrender.com/api/reports/total-claims', { headers }),
        axios.get('https://insaurence-management.onrender.com/api/reports/premium-collected', { headers })
      ]);

      setReports({
        customers: customersRes.data.count || 0,
        policies: policiesRes.data.count || 0,
        claims: claimsRes.data.count || 0,
        premiumAmount: premiumsRes.data.totalAmount || 0,
        claimsList: claimsRes.data.data || []
      });
    } catch (error) {
      console.log('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await axios.get('https://insaurence-management.onrender.com/api/customers/get-all', { headers: { Authorization: `Bearer ${token}` } });
      setCustomers(res.data.customers);
    } catch (err) {}
  };

  const loadAgents = async () => {
    try {
      const res = await axios.get('https://insaurence-management.onrender.com/api/auth/agents', { headers: { Authorization: `Bearer ${token}` } });
      setAgents(res.data.agents);
    } catch (err) {}
  };

  const loadPolicies = async () => {
    try {
      const res = await axios.get('https://insaurence-management.onrender.com/api/policies/all-policies', { headers: { Authorization: `Bearer ${token}` } });
      setPolicies(res.data.policies);
    } catch (err) {}
  };

  const loadClaims = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://insaurence-management.onrender.com/api/claims/all', { headers: { Authorization: `Bearer ${token}` } });
      setClaims(res.data.claims);
    } catch (err) {
      console.log('Error fetching claims');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://insaurence-management.onrender.com/api/premium/checkPaymentHistory', { headers: { Authorization: `Bearer ${token}` } });
      setPayments(res.data);
    } catch (err) {
      console.log('Error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await axios.get('https://insaurence-management.onrender.com/api/documents/all', { headers: { Authorization: `Bearer ${token}` } });
      setDocuments(res.data.documents || []);
    } catch (err) {}
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setCustomerMessage('');
    try {
      const formData = new FormData();
      formData.append('name', newCustomer.name);
      formData.append('email', newCustomer.email);
      formData.append('password', newCustomer.password);
      formData.append('phone', newCustomer.phone);
      formData.append('dob', newCustomer.dob);
      formData.append('address', newCustomer.address);
      if (newCustomer.profile_picture) {
        formData.append('profile_picture', newCustomer.profile_picture);
      }

      await axios.post('https://insaurence-management.onrender.com/api/customers/add-by-staff', formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      });
      setCustomerMessage('Customer created successfully!');
      setNewCustomer({ name: '', email: '', password: '', phone: '', dob: '', address: '', profile_picture: null });
      loadCustomers();
      fetchReports();
    } catch (err) {
      setCustomerMessage(err.response?.data?.message || 'Error creating customer');
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    setAgentMessage('');
    try {
      await axios.post('https://insaurence-management.onrender.com/api/auth/register', newAgent);
      setAgentMessage('Agent registered successfully!');
      setNewAgent({ name: '', email: '', password: '', role: 'Agent' });
      loadAgents();
    } catch (err) {
      setAgentMessage(err.response?.data?.message || 'Error creating agent');
    }
  };

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    setPolicyMessage('');
    try {
      await axios.post('https://insaurence-management.onrender.com/api/policies/create-policy', newPolicy, { headers: { Authorization: `Bearer ${token}` } });
      setPolicyMessage('Policy created successfully!');
      setNewPolicy({ customer_id: '', policy_number: '', policy_type: 'Health', policy_amount: '', policy_start_date: '', policy_end_date: '', policy_status: 'Active' });
      loadPolicies();
      fetchReports();
    } catch (err) {
      setPolicyMessage(err.response?.data?.message || 'Error creating policy');
    }
  };

  const updateClaimStatus = async (id, status) => {
    try {
      await axios.put(`https://insaurence-management.onrender.com/api/claims/update-status/${id}`, { claim_status: status }, { headers: { Authorization: `Bearer ${token}` } });
      loadClaims();
      fetchReports();
    } catch (err) {
      console.log('Error updating claim');
    }
  };

  const handleRenewPolicy = async (id, currentEndDate) => {
    try {
      const newEndDate = new Date(currentEndDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1); // Add 1 year
      await axios.put(`https://insaurence-management.onrender.com/api/policies/renew-policy/${id}`, { policy_end_date: newEndDate.toISOString() }, { headers: { Authorization: `Bearer ${token}` } });
      loadPolicies();
    } catch (err) {
      console.log('Error renewing policy');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer? This will also delete their user account, policies, claims, and payments.")) return;
    try {
      await axios.delete(`https://insaurence-management.onrender.com/api/customers/delete-customer/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      loadCustomers();
      fetchReports();
    } catch (err) {
      console.log('Error deleting customer');
    }
  };

  if (loading) return <div className="text-slate-800 text-center mt-20">Loading Admin Portal...</div>;

  const renderOverview = () => {
    const approved = reports?.claimsList?.filter(c => c.claim_status === 'Approved').length || 0;
    const rejected = reports?.claimsList?.filter(c => c.claim_status === 'Rejected').length || 0;
    const pending = reports?.claimsList?.filter(c => c.claim_status === 'Pending').length || 0;

    const doughnutData = {
      labels: ['Approved', 'Rejected', 'Pending'],
      datasets: [
        { data: [approved, rejected, pending], backgroundColor: ['#0ea5e9', '#ef4444', '#f59e0b'], borderColor: ['#0284c7', '#b91c1c', '#b45309'], borderWidth: 1 }
      ],
    };

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div onClick={() => { setActiveView('search-customers'); loadCustomers(); }} className="cursor-pointer hover:ring-2 hover:ring-sky-500 transition-all bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div><p className="text-slate-500 text-sm font-medium mb-1">Total Customers</p><h3 className="text-3xl font-bold text-slate-900">{reports?.customers}</h3></div>
            <div className="h-12 w-12 bg-sky-50 rounded-full flex items-center justify-center border border-sky-100"><Users className="h-6 w-6 text-sky-600" /></div>
          </div>
          <div onClick={() => { setActiveView('policies'); loadPolicies(); loadCustomers(); }} className="cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div><p className="text-slate-500 text-sm font-medium mb-1">Active Policies</p><h3 className="text-3xl font-bold text-slate-900">{reports?.policies}</h3></div>
            <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100"><FileText className="h-6 w-6 text-emerald-600" /></div>
          </div>
          <div onClick={() => { setActiveView('claims'); loadClaims(); }} className="cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div><p className="text-slate-500 text-sm font-medium mb-1">Total Claims</p><h3 className="text-3xl font-bold text-slate-900">{reports?.claims}</h3></div>
            <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100"><Activity className="h-6 w-6 text-rose-600" /></div>
          </div>
          <div onClick={() => { setActiveView('claims'); loadClaims(); }} className="cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div><p className="text-slate-500 text-sm font-medium mb-1">Total Revenue</p><h3 className="text-3xl font-bold text-slate-900">${reports?.premiumAmount?.toLocaleString()}</h3></div>
            <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100"><DollarSign className="h-6 w-6 text-amber-600" /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Claims Distribution</h2>
            <div className="h-64 flex justify-center">
              {reports?.claims > 0 ? <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, color: '#334155' }} /> : <p className="text-slate-500 self-center">No claims submitted yet.</p>}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Staff Quick Actions</h2>
            <div className="space-y-4">
              <button onClick={() => { setActiveView('policies'); loadPolicies(); loadCustomers(); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
                View All Policies <span className="text-sky-600">→</span>
              </button>
              <button onClick={() => { setActiveView('claims'); loadClaims(); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
                Review Pending Claims <span className="text-sky-600">→</span>
              </button>
              <button onClick={() => { setActiveView('payments'); loadPayments(); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
                Payment History <span className="text-sky-600">→</span>
              </button>
              <button onClick={() => { setActiveView('renewals'); loadPolicies(); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
                Policy Renewals <span className="text-sky-600">→</span>
              </button>
              <button onClick={() => { setActiveView('documents'); loadDocuments(); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
                Review Documents <span className="text-sky-600">→</span>
              </button>
              <button onClick={() => { setActiveView('search-customers'); loadCustomers(); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
                Search Customer Directory <span className="text-sky-600">→</span>
              </button>
              <button onClick={() => { setActiveView('add-customer'); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
                Register New Customer <span className="text-sky-600">→</span>
              </button>
              <button onClick={() => { setActiveView('agents'); loadAgents(); }} className="w-full bg-sky-50 hover:bg-sky-100 text-sky-800 p-4 rounded-xl text-left font-bold transition-colors border border-sky-200 flex justify-between items-center">
                Manage Agents <span className="text-sky-600">→</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };


  const renderSearchCustomers = () => {
    const filteredCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toString().includes(searchTerm)
    );

    return (
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
          <h2 className="text-2xl font-bold text-slate-900">Customer Directory</h2>
        </div>
        
        <input 
          type="text" 
          placeholder="Search by name, email, or phone..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none mb-6 shadow-sm"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2">
          {filteredCustomers.map(c => (
            <div key={c._id} className="p-6 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm flex flex-col items-center text-center">
              <img src={c.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0ea5e9&color=fff`} alt={c.name} className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-sky-100" />
              <p className="font-bold text-xl text-slate-900 mb-1">{c.name}</p>
              <p className="text-sm text-slate-500 mb-4">{c.email}</p>
              <div className="w-full space-y-2 text-left bg-white border border-slate-100 p-3 rounded-xl text-sm mb-4">
                <p><strong className="text-slate-600">Phone:</strong> {c.phone}</p>
                <p><strong className="text-slate-600">Address:</strong> {c.address}</p>
                <p><strong className="text-slate-600">DOB:</strong> {c.dob ? new Date(c.dob).toLocaleDateString() : 'N/A'}</p>
              </div>
              <button onClick={() => handleDeleteCustomer(c._id)} className="w-full mt-auto bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2 px-4 rounded-xl transition-colors border border-rose-200">
                Delete Customer
              </button>
            </div>
          ))}
          {filteredCustomers.length === 0 && <p className="text-slate-500 col-span-full text-center py-8 text-lg">No customers match your search.</p>}
        </div>
      </div>
    );
  };

  const renderAddCustomer = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="text-2xl font-bold text-slate-900">Register New Customer</h2>
      </div>
      {customerMessage && <p className="mb-6 text-sm font-medium text-sky-700 bg-sky-50 p-4 rounded-xl border border-sky-100">{customerMessage}</p>}
      <form onSubmit={handleAddCustomer} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="text" placeholder="Full Name" required value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          <input type="email" placeholder="Email Address" required value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          <input type="password" placeholder="Temporary Password" required value={newCustomer.password} onChange={e => setNewCustomer({...newCustomer, password: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          <input type="text" placeholder="Phone Number" required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          <input type="date" required value={newCustomer.dob} onChange={e => setNewCustomer({...newCustomer, dob: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          <div className="flex flex-col justify-center">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 px-1">Profile Picture (Optional)</label>
            <input type="file" accept="image/*" onChange={e => setNewCustomer({...newCustomer, profile_picture: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" />
          </div>
        </div>
        <textarea placeholder="Home Address" required value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none h-24"></textarea>
        <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-sky-600/20 text-lg mt-4">Create Customer Profile</button>
      </form>
    </div>
  );

  const renderManageAgents = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="text-2xl font-bold text-slate-900">Manage Agents</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Register New Agent</h3>
          {agentMessage && <p className="mb-4 text-sm font-medium text-sky-600 bg-sky-50 p-2 rounded">{agentMessage}</p>}
          <form onSubmit={handleAddAgent} className="space-y-4">
            <input type="text" placeholder="Agent Full Name" required value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            <input type="email" placeholder="Agent Email Address" required value={newAgent.email} onChange={e => setNewAgent({...newAgent, email: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            <input type="password" placeholder="Agent Password" required value={newAgent.password} onChange={e => setNewAgent({...newAgent, password: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg transition-colors">Register Agent Account</button>
          </form>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Agent Roster</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {agents.map(a => (
              <div key={a._id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <p className="font-bold text-slate-900">{a.name}</p>
                <p className="text-sm text-slate-500">{a.email}</p>
              </div>
            ))}
            {agents.length === 0 && <p className="text-slate-500 text-sm">No agents found.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderManagePolicies = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="text-2xl font-bold text-slate-900">All Policies Directory</h2>
      </div>
      <div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {policies.map(p => (
              <div key={p._id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{p.policy_number} <span className="text-sm font-normal text-slate-500">({p.policy_type})</span></p>
                  <p className="text-sm text-slate-600">Amount: ${p.policy_amount}</p>
                  {p.customer_id && <p className="text-xs text-slate-400 mt-1">Customer: {p.customer_id.name}</p>}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${p.policy_status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {p.policy_status}
                </span>
              </div>
            ))}
            {policies.length === 0 && <p className="text-slate-500 text-sm">No policies found.</p>}
          </div>
      </div>
    </div>
  );

  const renderManageClaims = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="text-2xl font-bold text-slate-900">Review Claims</h2>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {claims.map(c => (
          <div key={c._id} className="p-5 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-900">Claim Amount: ${c.claim_amount}</p>
              <p className="text-sm text-slate-600 mt-1">{c.claim_reason}</p>
              {c.policy_id && <p className="text-xs text-slate-400 mt-2">Policy: {c.policy_id.policy_number}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.claim_status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : c.claim_status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                {c.claim_status}
              </span>
              {c.claim_status === 'Pending' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateClaimStatus(c._id, 'Approved')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-bold transition-colors">Approve</button>
                  <button onClick={() => updateClaimStatus(c._id, 'Rejected')} className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm font-bold transition-colors">Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {claims.length === 0 && <p className="text-slate-500 text-sm">No claims to review.</p>}
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="text-2xl font-bold text-slate-900">Payment History</h2>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {payments.map(p => (
          <div key={p._id} className="p-5 border border-slate-200 rounded-xl bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="font-bold text-slate-900 text-lg">${p.amount} <span className="text-sm font-normal text-slate-500">via {p.payment_method || 'Cash'}</span></p>
              <p className="text-sm text-slate-600 mt-1">Policy: {p.policy_id?.policy_number} | Customer: {p.policy_id?.customer_id?.name || 'Unknown'}</p>
              {p.agent_id && <p className="text-xs text-slate-400 mt-1">Recorded by: {p.agent_id.name}</p>}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{p.status}</span>
              <span className="text-xs text-slate-500">{new Date(p.payment_date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {payments.length === 0 && <p className="text-slate-500 text-sm">No payments recorded.</p>}
      </div>
    </div>
  );

  const renderRenewals = () => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(now.getDate() + 30);
    
    const expiringPolicies = policies.filter(p => new Date(p.policy_end_date) < nextMonth);

    return (
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
          <h2 className="text-2xl font-bold text-slate-900">Policy Renewals</h2>
        </div>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {expiringPolicies.map(p => (
            <div key={p._id} className="p-5 border border-slate-200 rounded-xl bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="font-bold text-slate-900 text-lg">{p.policy_number} - {p.policy_type} (${p.policy_amount})</p>
                <p className="text-sm text-slate-600 mt-1">Customer: {p.customer_id?.name || 'Unknown'}</p>
                <p className={`text-xs mt-2 font-bold ${new Date(p.policy_end_date) < now ? 'text-rose-600' : 'text-amber-600'}`}>
                  {new Date(p.policy_end_date) < now ? 'EXPIRED: ' : 'EXPIRING: '} 
                  {new Date(p.policy_end_date).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => handleRenewPolicy(p._id, p.policy_end_date)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
                Renew (+1 Year)
              </button>
            </div>
          ))}
          {expiringPolicies.length === 0 && <p className="text-slate-500 text-sm">No policies are due for renewal.</p>}
        </div>
      </div>
    );
  };

  const renderDocuments = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="text-2xl font-bold text-slate-900">Customer Documents</h2>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {documents.map(d => (
          <div key={d._id} className="p-5 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-900">{d.document_type} - <span className="text-sm font-normal text-slate-500">{d.file_name}</span></p>
              <p className="text-sm text-slate-600 mt-1">Customer: {d.customer_id?.name || 'Unknown'}</p>
              <p className="text-xs text-slate-400 mt-1">Uploaded: {new Date(d.createdAt).toLocaleDateString()}</p>
            </div>
            <a href={`https://insaurence-management.onrender.com/${d.file_path}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
              View Document
            </a>
          </div>
        ))}
        {documents.length === 0 && <p className="text-slate-500 text-sm">No documents submitted.</p>}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Workspace</h1>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'search-customers' && renderSearchCustomers()}
      {activeView === 'add-customer' && renderAddCustomer()}
      {activeView === 'agents' && renderManageAgents()}
      {activeView === 'policies' && renderManagePolicies()}
      {activeView === 'claims' && renderManageClaims()}
      {activeView === 'payments' && renderPayments()}
      {activeView === 'renewals' && renderRenewals()}
      {activeView === 'documents' && renderDocuments()}
    </div>
  );
};

export default AdminDashboard;
