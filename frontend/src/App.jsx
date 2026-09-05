import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ConfirmModal from './components/ConfirmModal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MembersList from './pages/MembersList';
import MemberForm from './pages/MemberForm';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import WelcomeEmailModal from './components/WelcomeEmailModal';
import ReminderEmailModal from './components/ReminderEmailModal';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  LayoutDashboard,
  Users,
  PlusCircle,
  CreditCard,
  Bell
} from 'lucide-react';
import { 
  getMembers, 
  saveMembers, 
  getPayments, 
  savePayments, 
  initializeDb,
  fetchFromCloud,
  recordMemberReminder,
  recordMemberWelcomeEmail
} from './db/mockDb';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [welcomeMember, setWelcomeMember] = useState(null);
  const [reminderMemberData, setReminderMemberData] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Live dynamic compute of alerts count for badges across Header, Sidebar, and Mobile Nav
  const alertsCount = useMemo(() => {
    const today = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);

    let count = 0;
    members.forEach(m => {
      if (m.status === 'Active') {
        const endDate = new Date(m.endDate);
        if (endDate >= today && endDate <= fifteenDaysFromNow) {
          count++;
        }
      }
      if (m.paymentStatus === 'Pending') {
        count++;
      }
    });
    return count;
  }, [members]);

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
      updatedMembers = members.map(m => m.id === formData.id ? { ...m, ...formData } : m);
    } else {
      // Calculate robust unique Client ID from max existing ID
      const maxNum = members.reduce((max, m) => {
        const n = parseInt(String(m.id || '').replace(/\D/g, ''), 10);
        return !isNaN(n) && n > max ? n : max;
      }, 1000);
      const newId = `PXM-${maxNum + 1}`;
      const newMember = { ...formData, id: newId };
      updatedMembers = [newMember, ...members];
      
      // Also register initial payment log if Paid
      if (formData.paymentStatus === 'Paid') {
        const txnId = `TXN-${101 + payments.length}`;
        const newTxn = {
          id: txnId,
          clientId: newId,
          clientName: formData.fullName,
          amount: formData.amountPaid ? Number(formData.amountPaid) : 1000,
          date: formData.startDate || new Date().toISOString().split('T')[0],
          plan: formData.plan || 'Monthly',
          method: 'UPI'
        };
        const updatedPayments = [newTxn, ...payments];
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
    showToast(formData.id ? 'Member profile successfully updated!' : `Member successfully registered (${updatedMembers[0]?.id})!`, 'success');
    setCurrentPage('members');
  };

  // Request member deletion (triggers accessible confirmation modal)
  const handleDeleteMember = (id) => {
    const target = members.find(m => m.id === id);
    if (target) {
      setMemberToDelete(target);
    }
  };

  // Perform confirmed deletion
  const handleConfirmDeleteMember = () => {
    if (!memberToDelete) return;
    const target = memberToDelete;
    const updated = members.filter(m => m.id !== target.id);
    setMembers(updated);
    saveMembers(updated);
    setMemberToDelete(null);
    showToast(`Member profile for ${target.fullName} (${target.id}) deleted successfully.`, 'info');
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

  const handleReminderSent = (member, daysLeft) => {
    const reminderType = `${daysLeft}-Day Reminder`;
    const updated = recordMemberReminder(member.id, reminderType);
    setMembers(updated);
    showToast(`✅ ${reminderType} recorded & marked as sent today for ${member.fullName}!`, 'success');
  };

  const handleWhatsAppReminderSent = (member, daysLeft) => {
    const reminderType = `${daysLeft || 3}-Day WhatsApp Reminder`;
    const updated = recordMemberReminder(member.id, reminderType);
    setMembers(updated);
    showToast(`✅ Web WhatsApp reminder recorded for ${member.fullName}!`, 'success');
  };

  const handleWelcomeEmailSent = (member) => {
    const updated = recordMemberWelcomeEmail(member.id);
    setMembers(updated);
    showToast(`✅ Welcome Email recorded for ${member.fullName}!`, 'success');
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
        return (
          <Notifications 
            members={members} 
            payments={payments} 
            onMarkAsPaid={handleMarkAsPaid} 
            onSendReminderEmail={(m, daysLeft) => setReminderMemberData({ member: m, daysLeft })}
            onSendWhatsAppReminder={handleWhatsAppReminderSent}
            setPage={setCurrentPage} 
          />
        );
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
    <div className="flex flex-col md:flex-row bg-[#09090b] min-h-screen w-full max-w-full text-zinc-100 font-sans overflow-x-hidden">
      {/* Dynamic Toast Notification Container */}
      {toast && (
        <div className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-top-3 duration-200 ${
          toast.type === 'error' 
            ? 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/30' 
            : toast.type === 'warning'
            ? 'bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-amber-950/30'
            : toast.type === 'info'
            ? 'bg-zinc-900/95 border-white/20 text-zinc-200 shadow-black/50'
            : 'bg-[#121215]/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/20'
        }`}>
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-5 h-5 text-cyan-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <div>
            <p className="text-xs font-bold text-white leading-tight">
              {toast.type === 'error' ? 'Action Notice' : toast.type === 'info' ? 'System Update' : 'Action Confirmed'}
            </p>
            <p className="text-[11px] text-zinc-300 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Sidebar navigation */}
      <Sidebar 
        currentPage={currentPage === 'edit-member' ? 'members' : currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout} 
        alertsCount={alertsCount}
      />

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Desktop Top Header Bar */}
        <Header 
          title={pageTitles[currentPage] || 'Dashboard Telemetry'}
          user={user}
          setPage={setCurrentPage}
          alertsCount={alertsCount}
        />

        {/* Page content window */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-lg border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors cursor-pointer ${
            currentPage === 'dashboard' ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Home</span>
        </button>
        <button
          onClick={() => setCurrentPage('members')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors cursor-pointer ${
            currentPage === 'members' || currentPage === 'edit-member' ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">Members</span>
        </button>
        <button
          onClick={() => setCurrentPage('add-member')}
          className="flex flex-col items-center gap-0.5 px-3 py-1 -mt-3 text-white transition-transform active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-950/50 border-2 border-[#09090b]">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] text-zinc-300 font-bold">Enroll</span>
        </button>
        <button
          onClick={() => setCurrentPage('payments')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors cursor-pointer ${
            currentPage === 'payments' ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-[10px]">Billing</span>
        </button>
        <button
          onClick={() => setCurrentPage('notifications')}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors cursor-pointer ${
            currentPage === 'notifications' ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="text-[10px]">Alerts</span>
          {alertsCount > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
      </nav>

      {/* Confirmation Dialog for Destructive Member Deletions */}
      <ConfirmModal
        isOpen={!!memberToDelete}
        title="Delete Member Profile"
        message={`Are you sure you want to delete ${memberToDelete?.fullName} (${memberToDelete?.id})? This will remove their membership record permanently.`}
        confirmText="Delete Member"
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteMember}
        onCancel={() => setMemberToDelete(null)}
        isDestructive={true}
      />

      {/* Welcome Email Modal */}
      {welcomeMember && (
        <WelcomeEmailModal
          member={welcomeMember}
          onClose={() => setWelcomeMember(null)}
          onEmailSent={handleWelcomeEmailSent}
        />
      )}

      {/* Expiry Reminder Email Modal */}
      {reminderMemberData && (
        <ReminderEmailModal
          member={reminderMemberData.member}
          daysLeft={reminderMemberData.daysLeft}
          onClose={() => setReminderMemberData(null)}
          onEmailSent={handleReminderSent}
        />
      )}
    </div>
  );
}
