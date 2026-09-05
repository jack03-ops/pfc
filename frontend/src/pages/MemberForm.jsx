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
  const [formBannerError, setFormBannerError] = useState(null);
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
    let raw = e.target.value;
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.slice(2);
    }
    digits = digits.slice(0, 10);
    const formatted = digits ? `+91 ${digits}` : '+91 ';
    setFormData(prev => ({
      ...prev,
      [name]: formatted
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName || !formData.fullName.trim()) {
      tempErrors.fullName = 'Full Name is required';
    }
    
    const phoneDigits = String(formData.phone || '').replace(/\D/g, '').replace(/^91/, '');
    if (phoneDigits.length !== 10) {
      tempErrors.phone = 'Valid 10-digit mobile number required';
    }

    if (formData.whatsapp && formData.whatsapp.trim() !== '+91' && formData.whatsapp.trim() !== '') {
      const waDigits = String(formData.whatsapp || '').replace(/\D/g, '').replace(/^91/, '');
      if (waDigits.length > 0 && waDigits.length !== 10) {
        tempErrors.whatsapp = 'Valid 10-digit WhatsApp number required or leave blank';
      }
    }

    setErrors(tempErrors);
    const isValid = Object.keys(tempErrors).length === 0;
    if (!isValid) {
      const firstMsg = Object.values(tempErrors)[0];
      setFormBannerError(firstMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setFormBannerError(null), 6000);
    }
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const phoneDigits = String(formData.phone || '').replace(/\D/g, '').replace(/^91/, '');
    const waDigits = String(formData.whatsapp || '').replace(/\D/g, '').replace(/^91/, '');

    const sanitizedData = {
      ...formData,
      fullName: formData.fullName.trim(),
      phone: `+91 ${phoneDigits}`,
      whatsapp: waDigits ? `+91 ${waDigits}` : `+91 ${phoneDigits}`,
      village: formData.village?.trim() || 'Rampur',
      age: Number(formData.age) || 25,
      amountPaid: formData.amountPaid ? Number(formData.amountPaid) : 1000
    };

    onSave(sanitizedData, { sendWelcomeEmail: !isEditMode && sendWelcomeEmail && !!formData.email?.trim() });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-28 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            {isEditMode ? 'Modify Member Profile' : 'Enroll New Gym Member'}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Complete the member details below and click Save Member</p>
        </div>
        <button
          onClick={onCancel}
          className="btn-secondary p-2 rounded-xl text-zinc-400 hover:text-zinc-100 cursor-pointer"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {formBannerError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Please check form: {formBannerError}</span>
        </div>
      )}

      {/* Form Panel */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Personal & Physical Metrics */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Section 1: Personal Details */}
          <div className="card-premium p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <User className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Personal & Contact Details</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phoenix Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`input-premium w-full text-sm ${errors.fullName ? 'border-rose-500 ring-1 ring-rose-500/30' : ''}`}
                  placeholder="e.g. Rahul Sharma"
                />
                {errors.fullName && (
                  <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.fullName}
                  </div>
                )}
              </div>

              {/* Gender & DOB */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-premium w-full text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleDobChange}
                    className="input-premium w-full text-sm"
                  />
                </div>
              </div>

              {/* Age & Profession */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className={`input-premium w-full text-sm ${errors.age ? 'border-rose-500 ring-1 ring-rose-500/30' : ''}`}
                    placeholder="24"
                  />
                  {errors.age && (
                    <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.age}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Profession</label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="input-premium w-full text-sm"
                    placeholder="e.g. Engineer, Student"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Contact No. *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e, 'phone')}
                  maxLength="14"
                  className={`input-premium w-full text-sm ${errors.phone ? 'border-rose-500 ring-1 ring-rose-500/30' : ''}`}
                  placeholder="+91 9876543210"
                />
                {errors.phone && (
                  <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.phone}
                  </div>
                )}
              </div>

              {/* Emergency Contact No. */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Emergency Contact No.</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handlePhoneChange(e, 'emergencyContact')}
                  maxLength="14"
                  className="input-premium w-full text-sm"
                  placeholder="Parent / Guardian No."
                />
              </div>

              {/* E-mail Address */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">E-mail Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-premium w-full text-sm"
                  placeholder="client@example.com"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handlePhoneChange(e, 'whatsapp')}
                  maxLength="14"
                  className="input-premium w-full text-sm"
                  placeholder="Same as contact or separate"
                />
              </div>

              {/* Village */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Village / Town *</label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className={`input-premium w-full text-sm ${errors.village ? 'border-rose-500 ring-1 ring-rose-500/30' : ''}`}
                  placeholder="Village / Town Name"
                />
                {errors.village && (
                  <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.village}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="input-premium w-full text-sm resize-none"
                placeholder="Residential address details..."
              />
            </div>
          </div>

          {/* Section 2: Physical Metrics & Health Status */}
          <div className="card-premium p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Heart className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Physical Metrics & Health Status</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Height (cms) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="input-premium w-full text-sm"
                  placeholder="e.g. 175"
                />
              </div>

              {/* Weight (Kgs) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="input-premium w-full text-sm"
                  placeholder="e.g. 70"
                />
              </div>

              {/* BMI */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">BMI (Auto-calculated)</label>
                <input
                  type="text"
                  name="bmi"
                  value={formData.bmi}
                  readOnly
                  className="input-premium w-full text-sm text-amber-400 font-bold bg-zinc-900/50 cursor-default"
                  placeholder="e.g. 22.8"
                />
              </div>
            </div>

            {/* Any Medical condition / Allergic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Medical Condition / Allergy</label>
                <select
                  name="hasMedicalCondition"
                  value={formData.hasMedicalCondition}
                  onChange={handleChange}
                  className="input-premium w-full text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {formData.hasMedicalCondition === 'Yes' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Explain Medical Details</label>
                  <input
                    type="text"
                    name="medicalConditionDetails"
                    value={formData.medicalConditionDetails}
                    onChange={handleChange}
                    className="input-premium w-full text-sm text-rose-300"
                    placeholder="Describe asthma, injury, allergy, or conditions..."
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Enrollment & Subscription Info */}
        <div className="space-y-6">
          <div className="card-premium p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Dumbbell className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Gym Enrollment</h3>
            </div>

            {/* Purpose of Joining */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Purpose of Joining</label>
              <select
                name="purposeOfJoining"
                value={formData.purposeOfJoining}
                onChange={handleChange}
                className="input-premium w-full text-sm"
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
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Gym Experience</label>
                <select
                  name="gymExperience"
                  value={formData.gymExperience}
                  onChange={handleChange}
                  className="input-premium w-full text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Type</label>
                <select
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                  className="input-premium w-full text-sm"
                >
                  <option value="New">New</option>
                  <option value="Renewal">Renewal</option>
                </select>
              </div>
            </div>

            {/* Membership Plan */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Subscription Plan</label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="input-premium w-full text-sm font-medium"
              >
                {settings.membershipPlans.map(p => (
                  <option key={p.name} value={p.name}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>

            {/* Amount Paid (in Rupees) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Amount Paid (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-bold">₹</span>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  className="input-premium w-full pl-8 text-sm text-emerald-400 font-bold"
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Start Date & Joining Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="input-premium w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input-premium w-full text-xs"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Expiry Date (Auto-calculated)</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                readOnly
                className="input-premium w-full text-xs text-zinc-400 bg-zinc-900/50 cursor-not-allowed"
              />
            </div>

            {/* Payment & Member Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Payment Status</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="input-premium w-full text-sm font-semibold"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Member Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-premium w-full text-sm font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes & Actions */}
          <div className="card-premium p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Personal Fitness Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="input-premium w-full text-sm resize-none"
                placeholder="Time slot preferences, workout goals, specific notes..."
              />
            </div>

            {/* Send Welcome Email Toggle (New enrollments only) */}
            {!isEditMode && (
              <div className="flex items-center gap-2.5 p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  id="sendWelcomeEmail"
                  checked={sendWelcomeEmail}
                  onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                <label htmlFor="sendWelcomeEmail" className="text-xs text-zinc-300 font-medium cursor-pointer select-none flex items-center gap-1.5 flex-1">
                  <Mail className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Send Welcome Message to client upon enrollment</span>
                </label>
              </div>
            )}

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary w-1/2 py-2.5 text-xs cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-1/2 py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Member
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Floating Sticky Bottom Action Bar */}
        <div className="fixed bottom-16 left-0 right-0 p-3 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md flex items-center gap-3 z-30 md:hidden">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1 py-2.5 text-xs cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Member
          </button>
        </div>

      </form>
    </div>
  );
}
