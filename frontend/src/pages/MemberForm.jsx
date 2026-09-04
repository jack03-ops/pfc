import React, { useState, useEffect } from 'react';
import { Save, X, Sparkles, AlertCircle, Heart, User, Dumbbell, ShieldAlert, CreditCard, Mail } from 'lucide-react';
import { getSettings } from '../db/mockDb';

export default function MemberForm({ memberToEdit, onSave, onCancel }) {
  const isEditMode = !!memberToEdit;
  const settings = getSettings();

  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    phone: '+91 ',
    whatsapp: '+91 ',
    emergencyContact: '+91 ',
    email: '',
    village: '',
    address: '',
    gender: 'Male',
    dob: '',
    age: '',
    height: '',
    weight: '',
    bmi: '',
    profession: '',
    purposeOfJoining: 'Fitness',
    gymExperience: 'No',
    membershipType: 'New',
    joiningDate: new Date().toISOString().split('T')[0],
    plan: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    amountPaid: '1000',
    paymentStatus: 'Paid',
    status: 'Active',
    hasMedicalCondition: 'No',
    medicalConditionDetails: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Auto-calculate expiry date & default plan price based on selected Plan
  useEffect(() => {
    if (formData.plan && formData.startDate) {
      const selectedPlan = settings.membershipPlans.find(p => p.name === formData.plan);
      const months = selectedPlan ? selectedPlan.durationMonths : 1;
      const price = selectedPlan ? selectedPlan.price : 1000;
      
      const start = new Date(formData.startDate);
      if (!isNaN(start)) {
        start.setMonth(start.getMonth() + months);
        setFormData(prev => ({
          ...prev,
          endDate: start.toISOString().split('T')[0],
          // Update amountPaid if it matches a plan price or is default
          amountPaid: prev.amountPaid ? prev.amountPaid : String(price)
        }));
      }
    }
  }, [formData.plan, formData.startDate]);

  // Auto-calculate BMI from height (cm) and weight (kg)
  useEffect(() => {
    const h = parseFloat(formData.height);
    const w = parseFloat(formData.weight);

    if (h > 0 && w > 0) {
      const heightInMeters = h / 100;
      const calculatedBmi = (w / (heightInMeters * heightInMeters)).toFixed(1);
      setFormData(prev => ({
        ...prev,
        bmi: calculatedBmi
      }));
    }
  }, [formData.height, formData.weight]);

  // Auto-calculate Age from Date of Birth (DOB)
  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    let calculatedAge = formData.age;

    if (dobVal) {
      const birthDate = new Date(dobVal);
      const today = new Date();
      if (!isNaN(birthDate)) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age >= 12 && age <= 100) {
          calculatedAge = String(age);
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      dob: dobVal,
      age: calculatedAge
    }));
  };

  // Load existing member details on edit
  useEffect(() => {
    if (isEditMode && memberToEdit) {
      const formatPhone = (val) => {
        if (!val) return '+91 ';
        if (val.startsWith('+91 ')) return val;
        const cleaned = val.replace(/^\+91\s*/, '').replace(/\D/g, '');
        return '+91 ' + cleaned;
      };

      setFormData({
        ...memberToEdit,
        phone: formatPhone(memberToEdit.phone),
        whatsapp: formatPhone(memberToEdit.whatsapp),
        emergencyContact: formatPhone(memberToEdit.emergencyContact),
        email: memberToEdit.email || '',
        dob: memberToEdit.dob || '',
        height: memberToEdit.height ? String(memberToEdit.height) : '',
        weight: memberToEdit.weight ? String(memberToEdit.weight) : '',
        bmi: memberToEdit.bmi ? String(memberToEdit.bmi) : '',
        profession: memberToEdit.profession || '',
        purposeOfJoining: memberToEdit.purposeOfJoining || 'Fitness',
        gymExperience: memberToEdit.gymExperience || 'No',
        membershipType: memberToEdit.membershipType || 'New',
        amountPaid: memberToEdit.amountPaid ? String(memberToEdit.amountPaid) : '1000',
        hasMedicalCondition: memberToEdit.hasMedicalCondition || 'No',
        medicalConditionDetails: memberToEdit.medicalConditionDetails || ''
      });
    }
  }, [isEditMode, memberToEdit]);

  const handlePhoneChange = (e, name) => {
    let val = e.target.value;
    if (!val.startsWith('+91 ')) {
      const cleaned = val.replace(/^\+91\s*/, '').replace(/\D/g, '');
      val = '+91 ' + cleaned;
    } else {
      const suffix = val.substring(4).replace(/\D/g, '');
      val = '+91 ' + suffix;
    }

    if (val.length <= 14) {
      setFormData(prev => ({
        ...prev,
        [name]: val
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Full Name is required';
    
    const phoneDigits = formData.phone.substring(4).replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      tempErrors.phone = 'Valid 10-digit mobile number required';
    }

    const whatsappDigits = formData.whatsapp.substring(4).replace(/\D/g, '');
    if (formData.whatsapp.trim() !== '+91' && formData.whatsapp.trim() !== '' && whatsappDigits.length > 0 && whatsappDigits.length !== 10) {
      tempErrors.whatsapp = 'Valid 10-digit WhatsApp number required or leave blank';
    }

    if (!formData.village.trim()) tempErrors.village = 'Village name is required';
    if (!formData.age || formData.age < 12 || formData.age > 100) {
      tempErrors.age = 'Age must be between 12 and 100';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData, { sendWelcomeEmail: !isEditMode && sendWelcomeEmail && !!formData.email?.trim() });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex justify-end">
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-200 bg-zinc-900 border border-zinc-900 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Panel */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Personal & Physical Metrics */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Section 1: Personal Details */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <User className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Personal & Contact Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phoenix Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phoenix Name (Full Name) *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="e.g. Rahul Sharma"
                />
                {errors.fullName && (
                  <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName}
                  </div>
                )}
              </div>

              {/* Gender & DOB */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleDobChange}
                    className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Age & Profession */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                    placeholder="24"
                  />
                  {errors.age && (
                    <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                      {errors.age}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Profession</label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                    placeholder="e.g. Engineer, Student"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contact No. *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e, 'phone')}
                  maxLength="14"
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="e.g. +91 9876543210"
                />
                {errors.phone && (
                  <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </div>
                )}
              </div>

              {/* Emergency Contact No. */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Emergency Contact No.</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handlePhoneChange(e, 'emergencyContact')}
                  maxLength="14"
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="Parent / Guardian No."
                />
              </div>

              {/* E-mail Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">E-mail Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="client@example.com"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handlePhoneChange(e, 'whatsapp')}
                  maxLength="14"
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="Same as contact or separate"
                />
              </div>

              {/* Village */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Village / Town *</label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="Village / Town Name"
                />
                {errors.village && (
                  <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.village}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all resize-none"
                placeholder="Full residential address..."
              />
            </div>
          </div>

          {/* Section 2: Physical Metrics & Health Status */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Heart className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Physical Metrics & Health Status</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Height (cms) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Height (cms)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="e.g. 175"
                />
              </div>

              {/* Weight (Kgs) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Weight (Kgs)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="e.g. 70"
                />
              </div>

              {/* BMI */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">BMI (Auto-calculated)</label>
                <input
                  type="text"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/40 border border-zinc-900/80 rounded-xl text-xs text-amber-400 font-bold focus:outline-none"
                  placeholder="e.g. 22.8"
                />
              </div>
            </div>

            {/* Any Medical condition / Allergic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Medical Condition / Allergic</label>
                <select
                  name="hasMedicalCondition"
                  value={formData.hasMedicalCondition}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 font-semibold"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {formData.hasMedicalCondition === 'Yes' && (
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">If Yes, Explain details</label>
                  <input
                    type="text"
                    name="medicalConditionDetails"
                    value={formData.medicalConditionDetails}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-rose-300 focus:outline-none focus:border-red-500 transition-all"
                    placeholder="Describe asthma, injury, allergy, or conditions..."
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Enrollment & Subscription Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Dumbbell className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Gym Enrollment</h3>
            </div>

            {/* Purpose of Joining */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Purpose of Joining</label>
              <select
                name="purposeOfJoining"
                value={formData.purposeOfJoining}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Gain Weight">Gain Weight</option>
                <option value="Lose Weight">Lose Weight</option>
                <option value="Fitness">Fitness</option>
                <option value="Become Professional">Become Professional</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Gym Experience & Membership Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gym Experience</label>
                <select
                  name="gymExperience"
                  value={formData.gymExperience}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Membership Type</label>
                <select
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="New">New</option>
                  <option value="Renewal">Renewal</option>
                </select>
              </div>
            </div>

            {/* Membership Plan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subscription Plan</label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
              >
                {settings.membershipPlans.map(p => (
                  <option key={p.name} value={p.name}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>

            {/* Amount Paid (in Rupees) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amount Paid (in Rupees)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none focus:border-red-500 transition-all"
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Start Date & Joining Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Expiry Date (Auto-calculated)</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                readOnly
                className="w-full px-3.5 py-2.5 bg-zinc-950/40 border border-zinc-900/80 rounded-xl text-xs text-slate-400 focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Payment & Member Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Status</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-bold"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Member Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes & Actions */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Fitness Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all resize-none"
                placeholder="Time slot preferences, workout goals, specific notes..."
              />
            </div>

            {/* Send Welcome Email Toggle (New enrollments only) */}
            {!isEditMode && (
              <div className="flex items-center gap-2.5 p-3 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all">
                <input
                  type="checkbox"
                  id="sendWelcomeEmail"
                  checked={sendWelcomeEmail}
                  onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                <label htmlFor="sendWelcomeEmail" className="text-xs text-zinc-300 font-semibold cursor-pointer select-none flex items-center gap-1.5 flex-1">
                  <Mail className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Send Welcome Message to client upon enrollment</span>
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-1/2 py-2.5 bg-zinc-900 border border-zinc-900 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Member
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
