import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MembersList from './pages/MembersList';
import MemberForm from './pages/MemberForm';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import WelcomeEmailModal from './components/WelcomeEmailModal';
import { CheckCircle2 } from 'lucide-react';
import { 
  getMembers, 
  saveMembers, 
  getPayments, 
  savePayments, 
  initializeDb,
  fetchFromCloud
} from './db/mockDb';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [welcomeMember, setWelcomeMember] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Initialize DB, load state, and sync with centralized cloud database
  useEffect(() => {
    initializeDb();
    setMembers(getMembers());
    setPayments(getPayments());

    // Auto login check
    const savedUser = localStorage.getItem('phoenix_gym_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const syncLiveCloud = () => {
      fetchFromCloud().then(data => {
        if (data) {
          if (Array.isArray(data.members) && data.members.length > 0) {
            setMembers(data.members);
          }
          if (Array.isArray(data.payments) && data.payments.length > 0) {
            setPayments(data.payments);
          }
        }
      });
    };

    // 1. Initial live cloud sync
    syncLiveCloud();

    // 2. Real-time sync when switching between phone and laptop windows
    window.addEventListener('focus', syncLiveCloud);

    // 3. Periodic cloud poll every 6 seconds
    const interval = setInterval(syncLiveCloud, 6000);

    return () => {
      window.removeEventListener('focus', syncLiveCloud);
      clearInterval(interval);
    };
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('phoenix_gym_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('phoenix_gym_session');
  };

  // Add & Update Member Handler
  const handleSaveMember = (formData, options = {}) => {
    let updatedMembers = [];
    if (formData.id) {
      // Editing
      updatedMembers = members.map(m => m.id === formData.id ? formData : m);
    } else {
      // Create auto Client ID
      const nextId = 1001 + members.length;
      const newId = `PXM-${nextId}`;
      const newMember = { ...formData, id: newId };
      updatedMembers = [...members, newMember];
      
      // Also register initial payment log if Paid
      if (formData.paymentStatus === 'Paid') {
        const txnId = `TXN-${101 + payments.length}`;
        const newTxn = {
          id: txnId,
          clientId: newId,
          clientName: formData.fullName,
          amount: formData.amountPaid ? Number(formData.amountPaid) : 1000,
          date: formData.startDate,
          plan: formData.plan,
          method: 'UPI'
        };
        const updatedPayments = [...payments, newTxn];
        setPayments(updatedPayments);
        savePayments(updatedPayments);
      }

      // Automatically trigger Welcome Email modal if enabled or email exists
      if (options.sendWelcomeEmail || (newMember.email && newMember.email.trim())) {
        setWelcomeMember(newMember);
      }
    }
    
    setMembers(updatedMembers);
    saveMembers(updatedMembers);
    setMemberToEdit(null);
    showToast(formData.id ? 'Member profile successfully updated!' : 'Gym member successfully registered!', 'success');
    setCurrentPage('members');
  };

  // Delete member record
  const handleDeleteMember = (id) => {
    if (window.confirm(`Are you sure you want to delete member ${id}?`)) {
      const updated = members.filter(m => m.id !== id);
      setMembers(updated);
      saveMembers(updated);
      showToast('Member profile deleted successfully!', 'success');
    }
  };

  // Toggle subscriber status quickly
  const handleToggleStatus = (id) => {
    const updated = members.map(m => {
      if (m.id === id) {
        return { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return m;
    });
    setMembers(updated);
    saveMembers(updated);
    showToast('Member status updated successfully!', 'success');
  };

  const handleEditMemberTrigger = (member) => {
    setMemberToEdit(member);
    setCurrentPage('edit-member');
  };

  // Record Manual Payments
  const handleAddPayment = (paymentData) => {
    const txnId = `TXN-${101 + payments.length}`;
    const newTxn = {
      id: txnId,
      ...paymentData,
      date: new Date().toISOString().split('T')[0]
    };
    const updatedPayments = [...payments, newTxn];
    setPayments(updatedPayments);
    savePayments(updatedPayments);

    // Update member payment status as Paid
    const updatedMembers = members.map(m => {
      if (m.id === paymentData.clientId) {
        return { ...m, paymentStatus: 'Paid' };
      }
      return m;
    });
    setMembers(updatedMembers);
    saveMembers(updatedMembers);
  };

  // Quick mark outstanding balances as Paid
  const handleMarkAsPaid = (clientId, amount, plan) => {
    const memberObj = members.find(m => m.id === clientId);
    if (!memberObj) return;

    handleAddPayment({
      clientId,
      clientName: memberObj.fullName,
      amount,
      plan,
      method: 'UPI'
    });
  };

  // Render correct dashboard view based on active tab
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard members={members} payments={payments} setPage={setCurrentPage} />;
      case 'members':
        return (
          <MembersList 
            members={members} 
            onDeleteMember={handleDeleteMember} 
            onToggleStatus={handleToggleStatus} 
            onEditMember={handleEditMemberTrigger}
            onSendWelcomeEmail={(m) => setWelcomeMember(m)}
            setPage={setCurrentPage} 
          />
        );
      case 'add-member':
        return (
          <MemberForm 
            onSave={handleSaveMember} 
            onCancel={() => setCurrentPage('members')} 
          />
        );
      case 'edit-member':
        return (
          <MemberForm 
            memberToEdit={memberToEdit} 
            onSave={handleSaveMember} 
            onCancel={() => {
              setMemberToEdit(null);
              setCurrentPage('members');
            }} 
          />
        );
      case 'payments':
        return (
          <Payments 
            members={members} 
            payments={payments} 
            onAddPayment={handleAddPayment} 
            onMarkAsPaid={handleMarkAsPaid} 
          />
        );
      case 'reports':
        return <Reports members={members} payments={payments} />;
      case 'notifications':
        return <Notifications members={members} payments={payments} onMarkAsPaid={handleMarkAsPaid} setPage={setCurrentPage} />;
      case 'settings':
        return <Settings onSettingsUpdate={() => setMembers(getMembers())} />;
      default:
        return <Dashboard members={members} payments={payments} setPage={setCurrentPage} />;
    }
  };

  // Route guarding (Must log in to access telemetry)
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active Title configuration
  const pageTitles = {
    dashboard: 'Core Metrics Telemetry',
    members: 'Gym Members Directory',
    'add-member': 'Enroll Gym Member',
    'edit-member': 'Modify Member Profile',
    payments: 'Billing & Fee Receipts',
    reports: 'System Performance Reports',
    notifications: 'Alert Center Feed',
    settings: 'Gym configurations & custom pricing',
  };

  return (
    <div className="flex flex-col md:flex-row bg-[#030303] min-h-screen w-full max-w-full text-slate-100 font-sans overflow-x-hidden">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-zinc-900/95 border border-emerald-500/30 text-slate-100 px-5 py-4 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.15)] backdrop-blur-md transition-all duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">Success Action Logged</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Sidebar navigation */}
      <Sidebar 
        currentPage={currentPage === 'edit-member' ? 'members' : currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout} 
      />

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Page content window */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {/* Welcome Email Modal */}
      {welcomeMember && (
        <WelcomeEmailModal
          member={welcomeMember}
          onClose={() => setWelcomeMember(null)}
          onEmailSent={(m) => showToast(`Welcome email recorded for ${m.fullName}!`, 'success')}
        />
      )}
    </div>
  );
}
