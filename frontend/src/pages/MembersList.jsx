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
  Briefcase,
  MessageSquare,
  RotateCcw,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function MembersList({ members, onDeleteMember, onToggleStatus, onEditMember, onSendWelcomeEmail, setPage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all'); // all, name, id, phone, village
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive, expiring, pending
  const [viewingMember, setViewingMember] = useState(null);

  // Compute filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Search Query filter
      const term = searchTerm.toLowerCase().trim();
      let matchesSearch = true;

      if (term) {
        const idMatch = String(member.id || '').toLowerCase().includes(term);
        const nameMatch = String(member.fullName || '').toLowerCase().includes(term);
        const phoneMatch = String(member.phone || '').includes(term);
        const villageMatch = String(member.village || '').toLowerCase().includes(term);

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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fifteenDaysFromNow = new Date(today);
        fifteenDaysFromNow.setDate(today.getDate() + 15);
        const endDate = new Date(member.endDate);
        matchesFilter = member.status === 'Active' && endDate >= today && endDate <= fifteenDaysFromNow;
      }

      return matchesSearch && matchesFilter;
    });
  }, [members, searchTerm, searchField, statusFilter]);

  // WhatsApp Web direct trigger from directory
  const handleDirectWhatsApp = (member) => {
    const rawPhone = member.whatsapp || member.phone || '';
    const cleanPhone = String(rawPhone).replace(/\D/g, '').replace(/^91/, '');
    if (!cleanPhone) {
      alert(`No valid phone number for ${member.fullName}`);
      return;
    }

    const text = `Hello *${member.fullName}*,\n\nGreetings from *Phoenix Fitness Centre*! Hope you are crushing your workouts. Let us know if you need any assistance with your gym membership (${member.plan}) or training program.\n\n*Phoenix Fitness Centre*\n📞 +91 9487817301`;
    const encodedText = encodeURIComponent(text);
    const isDesktop = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isDesktop 
      ? `https://web.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedText}`;
    window.open(url, '_blank');
  };

  const isFiltered = searchTerm.trim() !== '' || searchField !== 'all' || statusFilter !== 'all';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchField('all');
    setStatusFilter('all');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wide">
            Members Directory
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Showing <strong className="text-white font-bold">{filteredMembers.length}</strong> of {members.length} registered fitness clients
          </p>
        </div>

        <button
          onClick={() => setPage('add-member')}
          className="btn-primary px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Member</span>
        </button>
      </div>

      {/* Filters Control Panel */}
      <div className="card-premium p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, ID, phone, village..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 input-premium text-xs placeholder:text-zinc-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Field Dropdown */}
          <div className="md:col-span-3">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full px-3 py-2.5 input-premium text-xs"
            >
              <option value="all">Search Across All Fields</option>
              <option value="name">Filter By Name</option>
              <option value="id">Filter By Client ID</option>
              <option value="phone">Filter By Phone No.</option>
              <option value="village">Filter By Village</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="md:col-span-3 flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 input-premium text-xs font-medium"
            >
              <option value="all">All Registrations</option>
              <option value="active">Active Subscriptions</option>
              <option value="inactive">Inactive Members</option>
              <option value="expiring">Expiring in 15 Days</option>
              <option value="pending">Pending Payments</option>
            </select>

            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="btn-secondary p-2.5 text-zinc-400 hover:text-white shrink-0"
                title="Reset Filters"
                aria-label="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Database Table (>= md) */}
      <div className="hidden md:block card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 text-[11px] uppercase font-bold tracking-wider">
                <th className="py-3.5 pl-6 pr-3">Client ID</th>
                <th className="py-3.5 px-3">Member Details</th>
                <th className="py-3.5 px-3">Contact</th>
                <th className="py-3.5 px-3">Village</th>
                <th className="py-3.5 px-3">Plan</th>
                <th className="py-3.5 px-3">Valid Until</th>
                <th className="py-3.5 px-3 text-center">Payment</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs text-zinc-300">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isExpired = new Date(member.endDate) < today;
                  
                  return (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* ID */}
                      <td className="py-3.5 pl-6 pr-3 font-bold text-red-400">
                        {member.id}
                      </td>

                      {/* Name & Basic details */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          {member.fullName}
                          {member.hasMedicalCondition === 'Yes' && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" title="Medical Alert" />
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-medium">
                          Age: {member.age || 25} • {member.gender} {member.profession ? `• ${member.profession}` : ''}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Phone className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{member.phone}</span>
                        </div>
                        {member.emergencyContact && member.emergencyContact !== '+91 ' && (
                          <div className="text-[10px] text-amber-400 font-medium mt-0.5">Emg: {member.emergencyContact}</div>
                        )}
                      </td>

                      {/* Village & Address */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1 text-white font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{member.village}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate max-w-[130px] mt-0.5">{member.address || 'N/A'}</div>
                      </td>

                      {/* Plan & Type */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg font-bold text-[11px] text-zinc-200">
                          {member.plan}
                        </span>
                      </td>

                      {/* End Date */}
                      <td className="py-3.5 px-3">
                        <span className={`font-semibold ${isExpired ? 'text-rose-400' : 'text-zinc-300'}`}>
                          {member.endDate}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          member.paymentStatus === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {member.paymentStatus}
                        </span>
                        {member.amountPaid && (
                          <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">₹{member.amountPaid}</div>
                        )}
                      </td>

                      {/* Status Toggle Button */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => onToggleStatus(member.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition-all ${
                            member.status === 'Active'
                              ? 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                          }`}
                          title={`Click to switch status to ${member.status === 'Active' ? 'Inactive' : 'Active'}`}
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
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Direct Web WhatsApp */}
                          <button
                            onClick={() => handleDirectWhatsApp(member)}
                            className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
                            title="Chat via Web WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => setViewingMember(member)}
                            className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-white/[0.06] rounded-lg transition-all cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit profile */}
                          <button
                            onClick={() => onEditMember(member)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {/* Welcome email */}
                          {member.email && (
                            <button
                              onClick={() => onSendWelcomeEmail && onSendWelcomeEmail(member)}
                              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                              title="Send Welcome Email & PDF"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete profile */}
                          <button
                            onClick={() => onDeleteMember(member.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
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
                  <td colSpan="9" className="py-12 text-center text-zinc-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p className="text-sm font-semibold text-zinc-400">No gym members match this filter</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear Filter & Show All
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Touch-Friendly Card View (< md) */}
      <div className="md:hidden space-y-3">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isExpired = new Date(member.endDate) < today;

            return (
              <div key={member.id} className="card-premium p-4 space-y-3">
                {/* Header row: ID, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center font-bold text-sm shrink-0">
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                        {member.fullName}
                        {member.hasMedicalCondition === 'Yes' && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" title="Medical Alert" />
                        )}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-medium">
                        <span className="text-red-400 font-bold">{member.id}</span> • {member.village}
                      </p>
                    </div>
                  </div>

                  {/* Status toggle pill */}
                  <button
                    onClick={() => onToggleStatus(member.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border transition-all shrink-0 ${
                      member.status === 'Active'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {member.status}
                  </button>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Plan & Expiry</span>
                    <span className="font-semibold text-zinc-200">{member.plan}</span>
                    <span className={`block text-[11px] font-medium ${isExpired ? 'text-rose-400' : 'text-zinc-400'}`}>
                      Expires: {member.endDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Fee Payment</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      member.paymentStatus === 'Paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {member.paymentStatus} {member.amountPaid ? `(₹${member.amountPaid})` : ''}
                    </span>
                  </div>
                </div>

                {/* Mobile Quick Action Buttons Bar */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    {/* Call Direct */}
                    <a
                      href={`tel:${member.phone.replace(/\D/g, '')}`}
                      className="p-2 text-zinc-300 hover:text-white bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Call</span>
                    </a>

                    {/* WhatsApp Web Direct */}
                    <button
                      onClick={() => handleDirectWhatsApp(member)}
                      className="p-2 text-emerald-400 hover:text-white bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* View */}
                    <button
                      onClick={() => setViewingMember(member)}
                      className="p-2 text-zinc-400 hover:text-white bg-white/[0.04] rounded-xl"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEditMember(member)}
                      className="p-2 text-zinc-400 hover:text-white bg-white/[0.04] rounded-xl"
                      title="Edit member"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteMember(member.id)}
                      className="p-2 text-zinc-400 hover:text-rose-400 bg-white/[0.04] rounded-xl"
                      title="Delete member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card-premium p-8 text-center space-y-3">
            <Users className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-400">No members match your criteria</p>
            <button
              onClick={handleResetFilters}
              className="btn-secondary px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* View Enrollment Details Modal */}
      {viewingMember && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setViewingMember(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">
                  PHOENIX FITNESS CENTRE ENROLLMENT RECORD
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  {viewingMember.fullName}
                  <span className="text-xs font-normal text-zinc-400">({viewingMember.id})</span>
                </h3>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="p-2 text-zinc-400 hover:text-white bg-white/[0.04] rounded-xl transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Section 1: Personal & Contact */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/[0.06] space-y-2">
                <div className="font-bold text-red-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-3">
                  <User className="w-3.5 h-3.5" /> Personal Details
                </div>
                <div><span className="text-zinc-500">Gender / Age:</span> <strong className="text-zinc-200">{viewingMember.gender} • {viewingMember.age || 25} yrs</strong></div>
                <div><span className="text-zinc-500">Date of Birth:</span> <strong className="text-zinc-200">{viewingMember.dob || 'N/A'}</strong></div>
                <div><span className="text-zinc-500">Profession:</span> <strong className="text-zinc-200">{viewingMember.profession || 'N/A'}</strong></div>
                <div><span className="text-zinc-500">Contact No:</span> <strong className="text-zinc-200">{viewingMember.phone}</strong></div>
                <div><span className="text-zinc-500">Emergency Contact:</span> <strong className="text-amber-400">{viewingMember.emergencyContact || 'N/A'}</strong></div>
                <div><span className="text-zinc-500">Email:</span> <strong className="text-zinc-200">{viewingMember.email || 'N/A'}</strong></div>
                <div><span className="text-zinc-500">Village / Town:</span> <strong className="text-zinc-200">{viewingMember.village}</strong></div>
                <div><span className="text-zinc-500">Address:</span> <strong className="text-zinc-200">{viewingMember.address || 'N/A'}</strong></div>
              </div>

              {/* Section 2: Health & Physical Metrics */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/[0.06] space-y-2">
                <div className="font-bold text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-3">
                  <Heart className="w-3.5 h-3.5" /> Health & Physical Metrics
                </div>
                <div><span className="text-zinc-500">Height:</span> <strong className="text-zinc-200">{viewingMember.height ? `${viewingMember.height} cms` : 'N/A'}</strong></div>
                <div><span className="text-zinc-500">Weight:</span> <strong className="text-zinc-200">{viewingMember.weight ? `${viewingMember.weight} Kgs` : 'N/A'}</strong></div>
                <div><span className="text-zinc-500">BMI:</span> <strong className="text-amber-400">{viewingMember.bmi || 'N/A'}</strong></div>
                <div><span className="text-zinc-500">Medical Condition:</span> <strong className={viewingMember.hasMedicalCondition === 'Yes' ? 'text-rose-400 font-bold' : 'text-zinc-200'}>{viewingMember.hasMedicalCondition || 'No'}</strong></div>
                {viewingMember.hasMedicalCondition === 'Yes' && (
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-[11px] mt-1">
                    <strong>Condition:</strong> {viewingMember.medicalConditionDetails || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Section 3: Gym & Subscription Details */}
              <div className="md:col-span-2 p-4 bg-black/40 rounded-xl border border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-3">
                    <Dumbbell className="w-3.5 h-3.5" /> Gym Enrollment Info
                  </div>
                  <div><span className="text-zinc-500">Purpose of Joining:</span> <strong className="text-zinc-200">{viewingMember.purposeOfJoining || 'Fitness'}</strong></div>
                  <div><span className="text-zinc-500">Gym Experience:</span> <strong className="text-zinc-200">{viewingMember.gymExperience || 'No'}</strong></div>
                  <div><span className="text-zinc-500">Membership Type:</span> <strong className="text-zinc-200">{viewingMember.membershipType || 'New'}</strong></div>
                  <div><span className="text-zinc-500">Joining Date:</span> <strong className="text-zinc-200">{viewingMember.joiningDate}</strong></div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-3">
                    <Calendar className="w-3.5 h-3.5" /> Subscription & Financials
                  </div>
                  <div><span className="text-zinc-500">Plan:</span> <strong className="text-zinc-200">{memberPlanDetails(viewingMember.plan)}</strong></div>
                  <div><span className="text-zinc-500">Amount Paid:</span> <strong className="text-emerald-400 font-bold">₹{viewingMember.amountPaid || '1000'}</strong></div>
                  <div><span className="text-zinc-500">Start Date:</span> <strong className="text-zinc-200">{viewingMember.startDate}</strong></div>
                  <div><span className="text-zinc-500">Expiry Date:</span> <strong className="text-zinc-200">{viewingMember.endDate}</strong></div>
                  <div><span className="text-zinc-500">Payment Status:</span> <strong className={viewingMember.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-rose-400'}>{viewingMember.paymentStatus}</strong></div>
                </div>
              </div>

              {/* Section 4: Notes */}
              {viewingMember.notes && (
                <div className="md:col-span-2 p-3 bg-black/40 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Personal Fitness Notes</span>
                  <p className="text-zinc-300 text-xs italic">{viewingMember.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap justify-between items-center gap-2.5 border-t border-white/[0.08] pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleDirectWhatsApp(viewingMember)}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/25 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Web
                </button>
                {viewingMember.email && (
                  <button
                    onClick={() => {
                      const m = viewingMember;
                      setViewingMember(null);
                      if (onSendWelcomeEmail) onSendWelcomeEmail(m);
                    }}
                    className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" /> Send Invoice Email
                  </button>
                )}
                <button
                  onClick={() => {
                    const m = viewingMember;
                    setViewingMember(null);
                    onEditMember(m);
                  }}
                  className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="btn-secondary px-4 py-1.5 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function memberPlanDetails(plan) {
  return plan || 'Monthly Plan';
}
