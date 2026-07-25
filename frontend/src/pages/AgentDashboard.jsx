import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, Activity, ArrowLeft } from 'lucide-react';

const AgentDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data lists
  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Form states
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', password: '', phone: '', dob: '', address: '' });
  const [newPolicy, setNewPolicy] = useState({ customer_id: '', policy_number: '', policy_type: 'Health', policy_amount: '', policy_start_date: '', policy_end_date: '', policy_status: 'Active' });
  const [newPayment, setNewPayment] = useState({ policy_id: '', amount: '' });
  const [message, setMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [customersRes, policiesRes, claimsRes] = await Promise.all([
        axios.get('https://insaurence-management.onrender.com/api/reports/total-customers', { headers }),
        axios.get('https://insaurence-management.onrender.com/api/reports/active-policies', { headers }),
        axios.get('https://insaurence-management.onrender.com/api/reports/total-claims', { headers })
      ]);

      setReports({
        customers: customersRes.data.count || 0,
        policies: policiesRes.data.count || 0,
        claims: claimsRes.data.count || 0,
      });
    } catch (error) {
      console.log('Error fetching data:', error);
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

  const loadPolicies = async () => {
    try {
      const res = await axios.get('https://insaurence-management.onrender.com/api/policies/all-policies', { headers: { Authorization: `Bearer ${token}` } });
      setPolicies(res.data.policies);
    } catch (err) {}
  };

  const loadClaims = async () => {
    try {
      const res = await axios.get('https://insaurence-management.onrender.com/api/claims/all', { headers: { Authorization: `Bearer ${token}` } });
      setClaims(res.data.claims);
    } catch (err) {}
  };

  const loadPayments = async () => {
    try {
      const res = await axios.get('https://insaurence-management.onrender.com/api/premium/checkPaymentHistory', { headers: { Authorization: `Bearer ${token}` } });
      setPayments(res.data);
    } catch (err) {}
  };

  const loadDocuments = async () => {
    try {
      const res = await axios.get('https://insaurence-management.onrender.com/api/documents/all', { headers: { Authorization: `Bearer ${token}` } });
      setDocuments(res.data.documents || []);
    } catch (err) {}
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('https://insaurence-management.onrender.com/api/customers/add-by-staff', {
        name: newCustomer.name,
        email: newCustomer.email,
        password: newCustomer.password,
        phone: newCustomer.phone,
        dob: newCustomer.dob,
        address: newCustomer.address
      }, { 
        headers: { 
          Authorization: `Bearer ${token}`
        } 
      });
      setMessage('Customer created successfully!');
      setNewCustomer({ name: '', email: '', password: '', phone: '', dob: '', address: '' });
      loadCustomers();
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating customer');
    }
  };

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('https://insaurence-management.onrender.com/api/policies/create-policy', newPolicy, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Policy created successfully!');
      setNewPolicy({ customer_id: '', policy_number: '', policy_type: 'Health', policy_amount: '', policy_start_date: '', policy_end_date: '', policy_status: 'Active' });
      loadPolicies();
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating policy');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('https://insaurence-management.onrender.com/api/premium/recordPremiumPayment', newPayment, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Payment recorded successfully!');
      setNewPayment({ policy_id: '', amount: '' });
      loadPayments();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error recording payment');
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
      fetchData();
    } catch (err) {
      console.log('Error deleting customer');
    }
  };

  const updateClaimStatus = async (id, status) => {
    try {
      await axios.put(`https://insaurence-management.onrender.com/api/claims/update-status/${id}`, { claim_status: status }, { headers: { Authorization: `Bearer ${token}` } });
      loadClaims();
    } catch (err) {
      console.log('Error updating claim');
    }
  };

  if (loading) return <div className="text-slate-800 text-center mt-20">Loading Agent Portal...</div>;

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div onClick={() => { setActiveView('search-customers'); loadCustomers(); }} className="cursor-pointer hover:ring-2 hover:ring-sky-500 transition-all bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div><p className="text-slate-500 text-sm font-medium mb-1">My Customers</p><h3 className="text-3xl font-bold text-slate-900">{reports?.customers}</h3></div>
          <div className="h-12 w-12 bg-sky-50 rounded-full flex items-center justify-center border border-sky-100"><Users className="h-6 w-6 text-sky-600" /></div>
        </div>
        <div onClick={() => { setActiveView('policies'); loadPolicies(); loadCustomers(); }} className="cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div><p className="text-slate-500 text-sm font-medium mb-1">Active Policies</p><h3 className="text-3xl font-bold text-slate-900">{reports?.policies}</h3></div>
          <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100"><FileText className="h-6 w-6 text-emerald-600" /></div>
        </div>
        <div onClick={() => { setActiveView('claims'); loadClaims(); }} className="cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div><p className="text-slate-500 text-sm font-medium mb-1">Total Claims</p><h3 className="text-3xl font-bold text-slate-900">{reports?.claims}</h3></div>
          <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100"><Activity className="h-6 w-6 text-amber-600" /></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-3xl">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => { setActiveView('search-customers'); loadCustomers(); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
            Search Customer Directory <span className="text-sky-600">→</span>
          </button>
          <button onClick={() => { setActiveView('add-customer'); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
            Register New Customer <span className="text-sky-600">→</span>
          </button>
          <button onClick={() => { setActiveView('policies'); loadPolicies(); loadCustomers(); }} className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
            Manage Policies <span className="text-sky-600">→</span>
          </button>
          <button onClick={() => { setActiveView('claims'); loadClaims(); }} className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
            View Claims <span className="text-sky-600">→</span>
          </button>
          <button onClick={() => { setActiveView('payments'); loadPayments(); }} className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
            Payment History <span className="text-sky-600">→</span>
          </button>
          <button onClick={() => { setActiveView('record-payment'); loadPolicies(); }} className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
            Record Payment <span className="text-sky-600">→</span>
          </button>
          <button onClick={() => { setActiveView('renewals'); loadPolicies(); }} className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
            Policy Renewals <span className="text-sky-600">→</span>
          </button>
          <button onClick={() => { setActiveView('documents'); loadDocuments(); }} className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl text-left font-medium transition-colors border border-slate-200 flex justify-between items-center">
            Review Documents <span className="text-sky-600">→</span>
          </button>
        </div>
      </div>
    </>
  );


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
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0ea5e9&color=fff`} alt={c.name} className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-sky-100" />
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
      {message && <p className="mb-6 text-sm font-medium text-sky-700 bg-sky-50 p-4 rounded-xl border border-sky-100">{message}</p>}
      <form onSubmit={handleAddCustomer} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="text" placeholder="Full Name" required value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          <input type="email" placeholder="Email Address" required value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          <input type="password" placeholder="Temporary Password" required value={newCustomer.password} onChange={e => setNewCustomer({...newCustomer, password: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          <input type="text" placeholder="Phone Number" required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          <input type="date" required value={newCustomer.dob} onChange={e => setNewCustomer({...newCustomer, dob: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
        </div>
        <textarea placeholder="Home Address" required value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none h-24"></textarea>
        <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-sky-600/20 text-lg mt-4">Create Customer Profile</button>
      </form>
    </div>
  );

  const renderManagePolicies = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="text-2xl font-bold text-slate-900">Manage Policies</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Create New Policy</h3>
          {message && <p className="mb-4 text-sm font-medium text-sky-600 bg-sky-50 p-2 rounded">{message}</p>}
          <form onSubmit={handleAddPolicy} className="space-y-4">
            <select required value={newPolicy.customer_id} onChange={e => setNewPolicy({...newPolicy, customer_id: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="Policy Number (e.g. POL-123)" required value={newPolicy.policy_number} onChange={e => setNewPolicy({...newPolicy, policy_number: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            <select required value={newPolicy.policy_type} onChange={e => setNewPolicy({...newPolicy, policy_type: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
              <option value="Health">Health</option>
              <option value="Home">Home</option>
              <option value="Life">Life</option>
            </select>
            <input type="number" placeholder="Policy Amount ($)" required value={newPolicy.policy_amount} onChange={e => setNewPolicy({...newPolicy, policy_amount: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
              <input type="date" required value={newPolicy.policy_start_date} onChange={e => setNewPolicy({...newPolicy, policy_start_date: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">End Date</label>
              <input type="date" required value={newPolicy.policy_end_date} onChange={e => setNewPolicy({...newPolicy, policy_end_date: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg transition-colors">Issue Policy</button>
          </form>
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">All Policies</h3>
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
    </div>
  );

  const renderManageClaims = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="text-2xl font-bold text-slate-900">View Claims</h2>
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
            </div>
          </div>
        ))}
        {claims.length === 0 && <p className="text-slate-500 text-sm">No claims to review.</p>}
      </div>
    </div>
  );

  const renderRecordPayment = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveView('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="text-2xl font-bold text-slate-900">Record Premium Payment</h2>
      </div>
      {message && <p className="mb-6 text-sm font-medium text-sky-700 bg-sky-50 p-4 rounded-xl border border-sky-100">{message}</p>}
      <form onSubmit={handleRecordPayment} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Select Policy</label>
          <select required value={newPayment.policy_id} onChange={e => setNewPayment({...newPayment, policy_id: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none">
            <option value="">-- Choose Policy --</option>
            {policies.map(p => (
              <option key={p._id} value={p._id}>{p.policy_number} - {p.customer_id?.name || 'Unknown'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Premium Amount ($)</label>
          <input type="number" required value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Enter amount" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
          <input type="text" disabled value="Cash" className="w-full p-3 border border-slate-300 rounded-xl bg-slate-100 text-slate-500 outline-none" />
        </div>
        <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm">
          Record Payment
        </button>
      </form>
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
          <div key={p._id} className="p-5 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-900 text-lg">${p.amount} <span className="text-sm font-normal text-slate-500">via {p.payment_method || 'Cash'}</span></p>
              <p className="text-sm text-slate-600 mt-1">Policy: {p.policy_id?.policy_number} | Customer: {p.policy_id?.customer_id?.name || 'Unknown'}</p>
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
            <div key={p._id} className="p-5 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
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
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Agent Workspace</h1>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'search-customers' && renderSearchCustomers()}
      {activeView === 'add-customer' && renderAddCustomer()}
      {activeView === 'policies' && renderManagePolicies()}
      {activeView === 'claims' && renderManageClaims()}
      {activeView === 'payments' && renderPayments()}
      {activeView === 'record-payment' && renderRecordPayment()}
      {activeView === 'renewals' && renderRenewals()}
      {activeView === 'documents' && renderDocuments()}
    </div>
  );
};

export default AgentDashboard;
