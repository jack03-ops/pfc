import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Phone, 
  MapPin, 
  UserCheck, 
  UserX,
  Plus,
  Eye,
  X,
  User,
  Heart,
  Dumbbell,
  ShieldAlert,
  Calendar,
  Mail,
  Briefcase
} from 'lucide-react';

export default function MembersList({ members, onDeleteMember, onToggleStatus, onEditMember, onSendWelcomeEmail, setPage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all'); // all, name, id, phone, village
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive, expiring, pending
  const [viewingMember, setViewingMember] = useState(null);

  // Compute live category counts
  const categoryCounts = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const fifteenDaysEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 23, 59, 59, 999);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let active = 0;
    let inactive = 0;
    let expiring = 0;
    let todayRenewals = 0;
    let pending = 0;

    members.forEach(m => {
      if (m.status === 'Active') active++;
      if (m.status === 'Inactive') inactive++;
      if (m.paymentStatus === 'Pending') pending++;
      
      if (m.status === 'Active' && m.endDate) {
        const parts = m.endDate.split('-');
        if (parts.length === 3) {
          const end = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59, 999);
          if (end >= todayStart && end <= fifteenDaysEnd) {
            expiring++;
          }
        }
      }

      const isDueToday = m.endDate === todayStr && m.status === 'Active';
      const renewedToday = (m.startDate === todayStr || m.joiningDate === todayStr) && (m.membershipType === 'Renewal' || m.paymentStatus === 'Paid');
      if (isDueToday || renewedToday) {
        todayRenewals++;
      }
    });

    return { active, inactive, expiring, todayRenewals, pending };
  }, [members]);

  // Compute filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Search Query filter
      const term = searchTerm.toLowerCase().trim();
      let matchesSearch = true;

      if (term) {
        const idMatch = member.id.toLowerCase().includes(term);
        const nameMatch = member.fullName.toLowerCase().includes(term);
        const phoneMatch = member.phone.includes(term);
        const villageMatch = member.village.toLowerCase().includes(term);

        if (searchField === 'all') {
          matchesSearch = idMatch || nameMatch || phoneMatch || villageMatch;
        } else if (searchField === 'name') {
          matchesSearch = nameMatch;
        } else if (searchField === 'id') {
          matchesSearch = idMatch;
        } else if (searchField === 'phone') {
          matchesSearch = phoneMatch;
        } else if (searchField === 'village') {
          matchesSearch = villageMatch;
        }
      }

      // 2. Status & Alert filters
      let matchesFilter = true;
      if (statusFilter === 'active') {
        matchesFilter = member.status === 'Active';
      } else if (statusFilter === 'inactive') {
        matchesFilter = member.status === 'Inactive';
      } else if (statusFilter === 'pending') {
        matchesFilter = member.paymentStatus === 'Pending';
      } else if (statusFilter === 'expiring') {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const fifteenDaysEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 23, 59, 59, 999);
        const parts = (member.endDate || '').split('-');
        if (parts.length === 3) {
          const end = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59, 999);
          matchesFilter = member.status === 'Active' && end >= todayStart && end <= fifteenDaysEnd;
        } else {
          matchesFilter = false;
        }
      } else if (statusFilter === 'today-renewals') {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const isDueToday = member.endDate === todayStr && member.status === 'Active';
        const renewedToday = (member.startDate === todayStr || member.joiningDate === todayStr) && (member.membershipType === 'Renewal' || member.paymentStatus === 'Paid');
        matchesFilter = isDueToday || renewedToday;
      }

      return matchesSearch && matchesFilter;
    });
  }, [members, searchTerm, searchField, statusFilter]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-[calc(100vh-80px)]">
      {/* Header Controls & Summary Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
        <div>
          <h2 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
            <User className="w-5 h-5 text-red-500" />
            Gym Members Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className="font-bold text-white">{filteredMembers.length}</span> member{filteredMembers.length === 1 ? '' : 's'} listed
            {filteredMembers.length !== members.length && (
              <span className="text-slate-500"> (filtered from {members.length} total)</span>
            )}
          </p>
        </div>

        <button
          onClick={() => setPage('add-member')}
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Filters Control Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-900 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search Inputs */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search members database..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-all"
            />
          </div>

          {/* Search Field Dropdown */}
          <div className="md:col-span-3">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
            >
              <option value="all">Search In All Fields</option>
              <option value="name">Search By Full Name</option>
              <option value="id">Search By Client ID</option>
              <option value="phone">Search By Phone No.</option>
              <option value="village">Search By Village</option>
            </select>
          </div>

          {/* Quick Filters with live counters */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 font-semibold"
            >
              <option value="all">All Registrations ({members.length})</option>
              <option value="active">Active Subscriptions ({categoryCounts.active})</option>
              <option value="inactive">Inactive Members ({categoryCounts.inactive})</option>
              <option value="expiring">Expiring in 15 Days ({categoryCounts.expiring})</option>
              <option value="today-renewals">Today's Renewals ({categoryCounts.todayRenewals})</option>
              <option value="pending">Pending Payments ({categoryCounts.pending})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database Table Panel */}
      <div className="glass-panel rounded-2xl border border-zinc-900 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/45 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                <th className="p-4 pl-6">Client ID</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Phone / Contact</th>
                <th className="p-4">Village & Address</th>
                <th className="p-4">Plan & Type</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4 text-center">Payment</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-xs text-slate-300">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const today = new Date();
                  const isExpired = new Date(member.endDate) < today;
                  
                  return (
                    <tr key={member.id} className="hover:bg-zinc-900/30 transition-colors">
                      {/* ID */}
                      <td className="p-4 pl-6 font-bold text-red-400">
                        {member.id}
                      </td>

                      {/* Name & Basic details */}
                      <td className="p-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          {member.fullName}
                          {member.hasMedicalCondition === 'Yes' && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="Medical Alert" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Age: {member.age} • {member.gender} {member.profession ? `• ${member.profession}` : ''}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{member.phone}</span>
                        </div>
                        {member.emergencyContact && member.emergencyContact !== '+91 ' && (
                          <div className="text-[9px] text-amber-400 font-medium mt-0.5">Emergency: {member.emergencyContact}</div>
                        )}
                      </td>

                      {/* Village & Address */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-white font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {member.village}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px] mt-0.5">{member.address || 'N/A'}</div>
                      </td>

                      {/* Plan & Type */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="px-2.5 py-1 bg-zinc-900 border border-slate-700/65 rounded-lg font-bold text-[10px] uppercase text-slate-300">
                            {member.plan}
                          </span>
                          {member.membershipType && (
                            <span className="px-1.5 py-0.5 bg-zinc-950 text-[9px] font-semibold text-slate-400 rounded border border-zinc-800">
                              {member.membershipType}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* End Date */}
                      <td className="p-4">
                        <span className={`font-semibold ${isExpired ? 'text-rose-400' : 'text-slate-400'}`}>
                          {member.endDate}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          member.paymentStatus === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {member.paymentStatus}
                        </span>
                        {member.amountPaid && (
                          <div className="text-[9px] text-slate-400 font-bold mt-0.5">₹{member.amountPaid}</div>
                        )}
                      </td>

                      {/* Status Toggle Button */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onToggleStatus(member.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer border transition-all ${
                            member.status === 'Active'
                              ? 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20'
                              : 'bg-zinc-900 text-slate-500 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {member.status === 'Active' ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                        {member.lastReminderDate === new Date().toISOString().split('T')[0] && (
                          <span className="block mt-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                            ✓ Reminder Sent
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View details button */}
                          <button
                            onClick={() => setViewingMember(member)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                            title="View Full Enrollment Form"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => onEditMember(member)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {/* Send Welcome Email button */}
                          {member.email && (
                            <button
                              onClick={() => onSendWelcomeEmail && onSendWelcomeEmail(member)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                              title="Send Welcome Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={() => onDeleteMember(member.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-slate-500">
                    No members match the query or filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Enrollment Details Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest">PHOENIX FITNESS CENTRE ENROLLMENT RECORD</span>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  {viewingMember.fullName}
                  <span className="text-xs font-normal text-slate-400">({viewingMember.id})</span>
                </h3>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="p-2 text-slate-400 hover:text-white bg-zinc-900 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Section 1: Personal & Contact */}
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 space-y-2">
                <div className="font-extrabold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-3 text-red-400">
                  <User className="w-3.5 h-3.5" /> Personal Details
                </div>
                <div><span className="text-slate-500">Gender / Age:</span> <strong className="text-slate-200">{viewingMember.gender} • {viewingMember.age} yrs</strong></div>
                <div><span className="text-slate-500">Date of Birth:</span> <strong className="text-slate-200">{viewingMember.dob || 'N/A'}</strong></div>
                <div><span className="text-slate-500">Profession:</span> <strong className="text-slate-200">{viewingMember.profession || 'N/A'}</strong></div>
                <div><span className="text-slate-500">Contact No:</span> <strong className="text-slate-200">{viewingMember.phone}</strong></div>
                <div><span className="text-slate-500">Emergency Contact:</span> <strong className="text-amber-400">{viewingMember.emergencyContact || 'N/A'}</strong></div>
                <div><span className="text-slate-500">Email:</span> <strong className="text-slate-200">{viewingMember.email || 'N/A'}</strong></div>
                <div><span className="text-slate-500">Village / Town:</span> <strong className="text-slate-200">{viewingMember.village}</strong></div>
                <div><span className="text-slate-500">Address:</span> <strong className="text-slate-200">{viewingMember.address || 'N/A'}</strong></div>
              </div>

              {/* Section 2: Health & Physical Metrics */}
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 space-y-2">
                <div className="font-extrabold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-3 text-rose-400">
                  <Heart className="w-3.5 h-3.5" /> Health & Physical Metrics
                </div>
                <div><span className="text-slate-500">Height:</span> <strong className="text-slate-200">{viewingMember.height ? `${viewingMember.height} cms` : 'N/A'}</strong></div>
                <div><span className="text-slate-500">Weight:</span> <strong className="text-slate-200">{viewingMember.weight ? `${viewingMember.weight} Kgs` : 'N/A'}</strong></div>
                <div><span className="text-slate-500">BMI:</span> <strong className="text-amber-400">{viewingMember.bmi || 'N/A'}</strong></div>
                <div><span className="text-slate-500">Medical Condition / Allergic:</span> <strong className={viewingMember.hasMedicalCondition === 'Yes' ? 'text-rose-400 font-black' : 'text-slate-200'}>{viewingMember.hasMedicalCondition || 'No'}</strong></div>
                {viewingMember.hasMedicalCondition === 'Yes' && (
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-[11px] mt-1">
                    <strong>Medical Explanation:</strong> {viewingMember.medicalConditionDetails || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Section 3: Gym & Subscription Details */}
              <div className="md:col-span-2 p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-extrabold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-3 text-amber-400">
                    <Dumbbell className="w-3.5 h-3.5" /> Gym Enrollment Info
                  </div>
                  <div><span className="text-slate-500">Purpose of Joining:</span> <strong className="text-slate-200">{viewingMember.purposeOfJoining || 'Fitness'}</strong></div>
                  <div><span className="text-slate-500">Gym Experience:</span> <strong className="text-slate-200">{viewingMember.gymExperience || 'No'}</strong></div>
                  <div><span className="text-slate-500">Membership Type:</span> <strong className="text-slate-200">{viewingMember.membershipType || 'New'}</strong></div>
                  <div><span className="text-slate-500">Joining Date:</span> <strong className="text-slate-200">{viewingMember.joiningDate}</strong></div>
                </div>

                <div className="space-y-2">
                  <div className="font-extrabold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-3 text-emerald-400">
                    <Calendar className="w-3.5 h-3.5" /> Subscription & Financials
                  </div>
                  <div><span className="text-slate-500">Plan:</span> <strong className="text-slate-200">{viewingMember.plan}</strong></div>
                  <div><span className="text-slate-500">Amount Paid:</span> <strong className="text-emerald-400 font-bold">₹{viewingMember.amountPaid || '1000'}</strong></div>
                  <div><span className="text-slate-500">Start Date:</span> <strong className="text-slate-200">{viewingMember.startDate}</strong></div>
                  <div><span className="text-slate-500">Expiry Date:</span> <strong className="text-slate-200">{viewingMember.endDate}</strong></div>
                  <div><span className="text-slate-500">Payment Status:</span> <strong className={viewingMember.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-rose-400'}>{viewingMember.paymentStatus}</strong></div>
                  {viewingMember.lastReminderDate && (
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-300 text-[10px] mt-2">
                      <span>✓ {viewingMember.lastReminderType || 'Reminder'} Sent: {viewingMember.lastReminderDate} {viewingMember.lastReminderTime ? `(${viewingMember.lastReminderTime})` : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Notes */}
              {viewingMember.notes && (
                <div className="md:col-span-2 p-3 bg-zinc-900/60 rounded-xl border border-zinc-900">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Personal Fitness Notes</span>
                  <p className="text-slate-300 text-xs italic">{viewingMember.notes}</p>
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap justify-between items-center gap-2 border-t border-zinc-900 pt-4">
              <div className="flex items-center gap-2">
                {viewingMember.email && (
                  <button
                    onClick={() => {
                      const m = viewingMember;
                      setViewingMember(null);
                      if (onSendWelcomeEmail) onSendWelcomeEmail(m);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-950/30"
                  >
                    <Mail className="w-4 h-4" /> Send Welcome Email
                  </button>
                )}
                <button
                  onClick={() => {
                    const m = viewingMember;
                    setViewingMember(null);
                    onEditMember(m);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
