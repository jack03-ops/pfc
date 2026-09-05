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
import ReminderEmailModal from './components/ReminderEmailModal';
import RenewModal from './components/RenewModal';
import { CheckCircle2 } from 'lucide-react';
import { 
  getMembers, 
  saveMembers, 
  deleteMember,
  getPayments, 
  savePayments, 
  initializeDb,
  fetchFromCloud,
  recordMemberReminder,
  recordMemberWelcomeEmail,
  getClearedNotificationIds,
  saveClearedNotificationIds
} from './db/mockDb';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [toast, setToast] = useState(null);
  const [welcomeMember, setWelcomeMember] = useState(null);
  const [reminderMemberData, setReminderMemberData] = useState(null);
  const [renewModalMember, setRenewModalMember] = useState(null);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [clearedNotificationIds, setClearedNotificationIds] = useState(() => getClearedNotificationIds());

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Compute active, un-cleared alerts for Sidebar badge
  const activeAlertsCount = React.useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const fifteenDaysEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 23, 59, 59, 999);

    let count = 0;
    members.forEach(m => {
      if (m.endDate) {
        const parts = m.endDate.split('-');
        if (parts.length === 3) {
          const end = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59, 999);
          const isExpired = end.getTime() < todayStart.getTime() || m.status === 'Expired';
          const isExpiring = !isExpired && end >= todayStart && end <= fifteenDaysEnd;
          if (isExpired || isExpiring) {
            if (!clearedNotificationIds.includes(`exp-${m.id}`)) {
              count++;
            }
          }
        }
      }
      if (m.paymentStatus === 'Pending') {
        if (!clearedNotificationIds.includes(`pend-${m.id}`)) {
          count++;
        }
      }
    });
    return count;
  }, [members, clearedNotificationIds]);

  const handleClearNotification = (id) => {
    setClearedNotificationIds(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      saveClearedNotificationIds(next);
      return next;
    });
  };

  const handleClearAllNotifications = (idsToClear) => {
    setClearedNotificationIds(prev => {
      const set = new Set([...prev, ...idsToClear]);
      const next = Array.from(set);
      saveClearedNotificationIds(next);
      return next;
    });
    showToast('Notifications cleared');
  };

  const handleRestoreNotifications = () => {
    setClearedNotificationIds([]);
    saveClearedNotificationIds([]);
    showToast('Notifications restored');
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

  // Delete member record
  const handleDeleteMember = (id) => {
    if (window.confirm(`Are you sure you want to delete member ${id}?`)) {
      const updated = deleteMember(id);
      setMembers(updated);
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

  // Membership Renewal Handlers
  const handleOpenRenewModal = (member = null) => {
    setRenewModalMember(member);
    setIsRenewModalOpen(true);
  };

  const handleConfirmRenew = ({ memberId, plan, amount, paymentMethod, newStartDate, newEndDate, notes }) => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    // 1. Update member state: activate membership, update end date, set renewal type & paid status
    const updatedMembers = members.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: 'Active',
          membershipType: 'Renewal',
          paymentStatus: 'Paid',
          amountPaid: amount,
          plan: plan,
          startDate: newStartDate,
          endDate: newEndDate,
          lastRenewalDate: newStartDate,
          notes: notes ? (m.notes ? `${m.notes} | ${notes}` : notes) : m.notes
        };
      }
      return m;
    });

    setMembers(updatedMembers);
    saveMembers(updatedMembers);

    // 2. Register renewal payment ledger transaction
    const txnId = `TXN-${101 + payments.length}`;
    const newTxn = {
      id: txnId,
      clientId: memberId,
      clientName: targetMember.fullName,
      amount: amount,
      date: newStartDate,
      plan: plan,
      type: 'Renewal',
      method: paymentMethod || 'UPI',
      notes: notes || 'Membership Renewal'
    };
    const updatedPayments = [newTxn, ...payments];
    setPayments(updatedPayments);
    savePayments(updatedPayments);

    // 3. Clear any past expiration alert for this member from notifications
    setClearedNotificationIds(prev => {
      const expId = `exp-${memberId}`;
      const next = prev.includes(expId) ? prev : [...prev, expId];
      saveClearedNotificationIds(next);
      return next;
    });

    // 4. Show success toast feedback
    showToast(`🎉 Membership renewed for ${targetMember.fullName}! New validity through ${newEndDate}`, 'success');
  };

  // Render correct dashboard view based on active tab
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard members={members} payments={payments} setPage={setCurrentPage} onRenewMember={handleOpenRenewModal} />;
      case 'members':
        return (
          <MembersList 
            members={members} 
            onDeleteMember={handleDeleteMember} 
            onToggleStatus={handleToggleStatus} 
            onEditMember={handleEditMemberTrigger}
            onSendWelcomeEmail={(m) => setWelcomeMember(m)}
            onRenewMember={handleOpenRenewModal}
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
            clearedIds={clearedNotificationIds}
            onClearNotification={handleClearNotification}
            onClearAllNotifications={handleClearAllNotifications}
            onRestoreNotifications={handleRestoreNotifications}
            onMarkAsPaid={handleMarkAsPaid} 
            onSendReminderEmail={(m, daysLeft) => setReminderMemberData({ member: m, daysLeft })}
            onSendWhatsAppReminder={handleWhatsAppReminderSent}
            onRenewMember={handleOpenRenewModal}
            setPage={setCurrentPage} 
          />
        );
      case 'settings':
        return <Settings onSettingsUpdate={() => setMembers(getMembers())} />;
      default:
        return <Dashboard members={members} payments={payments} setPage={setCurrentPage} onRenewMember={handleOpenRenewModal} />;
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
        alertsCount={activeAlertsCount}
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

      {/* Membership Renewal Modal */}
      {isRenewModalOpen && (
        <RenewModal
          member={renewModalMember}
          allMembers={members}
          onClose={() => {
            setIsRenewModalOpen(false);
            setRenewModalMember(null);
          }}
          onConfirmRenew={handleConfirmRenew}
        />
      )}
    </div>
  );
}
