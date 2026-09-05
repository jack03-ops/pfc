import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Plus, Trash2, Shield, Heart, CheckCircle2 } from 'lucide-react';
import { getSettings, saveSettings } from '../db/mockDb';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings({ onSettingsUpdate }) {
  const [settings, setSettings] = useState(getSettings());
  const [newPlan, setNewPlan] = useState({ name: '', durationMonths: 1, price: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [planToDelete, setPlanToDelete] = useState(null);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlanChange = (index, field, value) => {
    const updatedPlans = [...settings.membershipPlans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      [field]: field === 'price' || field === 'durationMonths' ? Number(value) : value
    };
    setSettings(prev => ({
      ...prev,
      membershipPlans: updatedPlans
    }));
  };

  const confirmDeletePlan = () => {
    if (!planToDelete) return;
    const updatedPlans = settings.membershipPlans.filter((_, idx) => idx !== planToDelete.index);
    setSettings(prev => ({
      ...prev,
      membershipPlans: updatedPlans
    }));
    setPlanToDelete(null);
  };

  const handleAddPlanSubmit = (e) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price) return;

    const updatedPlans = [
      ...settings.membershipPlans,
      {
        name: newPlan.name,
        durationMonths: Number(newPlan.durationMonths),
        price: Number(newPlan.price)
      }
    ];

    setSettings(prev => ({
      ...prev,
      membershipPlans: updatedPlans
    }));

    setNewPlan({ name: '', durationMonths: 1, price: '' });
  };

  const handleSaveAll = () => {
    saveSettings(settings);
    if (onSettingsUpdate) onSettingsUpdate(settings);
    setSuccessMsg('System parameters updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">System & Club Settings</h2>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">Manage club branding, currency, and membership subscription plans</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Core Settings card */}
        <div className="card-premium p-5 sm:p-7 space-y-6 lg:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider pb-2 border-b border-zinc-800">
              Branding & Regional Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Gym / Academy Name</label>
                <input
                  type="text"
                  name="gymName"
                  value={settings.gymName}
                  onChange={handleSettingsChange}
                  className="input-premium w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Billing Currency</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleSettingsChange}
                  className="input-premium w-full text-sm font-medium"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider pb-2 border-b border-zinc-800">
              Membership Plans & Pricing
            </h3>
            
            <div className="space-y-3 mt-4">
              {/* Header labels */}
              <div className="hidden sm:grid grid-cols-12 gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="col-span-5">Plan Label</span>
                <span className="col-span-3">Duration</span>
                <span className="col-span-3">Price (₹)</span>
                <span className="col-span-1 text-center">Action</span>
              </div>

              {settings.membershipPlans.map((plan, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 sm:gap-3 items-center p-2.5 sm:p-0 bg-zinc-900/40 sm:bg-transparent rounded-xl border border-zinc-800/80 sm:border-0">
                  <div className="col-span-12 sm:col-span-5">
                    <label className="sm:hidden text-[10px] font-semibold text-zinc-400 block mb-1">Plan Label</label>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => handlePlanChange(idx, 'name', e.target.value)}
                      className="input-premium w-full text-xs sm:text-sm"
                      placeholder="Plan Label"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="sm:hidden text-[10px] font-semibold text-zinc-400 block mb-1">Months</label>
                    <input
                      type="number"
                      value={plan.durationMonths}
                      onChange={(e) => handlePlanChange(idx, 'durationMonths', e.target.value)}
                      className="input-premium w-full text-xs sm:text-sm"
                      placeholder="Months"
                      title="Duration in Months"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-3">
                    <label className="sm:hidden text-[10px] font-semibold text-zinc-400 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => handlePlanChange(idx, 'price', e.target.value)}
                      className="input-premium w-full text-xs sm:text-sm font-semibold text-emerald-400"
                      placeholder="Price"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-center flex justify-end sm:justify-center">
                    <button
                      onClick={() => setPlanToDelete({ index: idx, name: plan.name })}
                      className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add custom plan sub-form */}
            <div className="mt-5 p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
              <h4 className="text-xs font-semibold text-zinc-300 mb-3">Add Custom Membership Plan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <input
                  type="text"
                  placeholder="Plan Name (e.g. 5 Months)"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                  className="input-premium w-full text-xs"
                />
                <input
                  type="number"
                  placeholder="Duration (Months)"
                  value={newPlan.durationMonths}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, durationMonths: e.target.value }))}
                  className="input-premium w-full text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))}
                    className="input-premium w-full text-xs"
                  />
                  <button
                    onClick={handleAddPlanSubmit}
                    type="button"
                    className="btn-primary p-2 flex items-center justify-center cursor-pointer shrink-0"
                    title="Add Plan"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & System sidecards */}
        <div className="space-y-6">
          <div className="card-premium p-6 text-center space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Phoenix Fitness Centre</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cloud sync active. All settings and configuration changes are persisted across local devices and deployed clients.
              </p>
            </div>
            
            <button
              onClick={handleSaveAll}
              className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Plan Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!planToDelete}
        title="Delete Membership Plan"
        message={`Are you sure you want to remove "${planToDelete?.name}"? Members currently enrolled on this plan will maintain their records, but new members will not be able to select it.`}
        confirmText="Delete Plan"
        confirmVariant="danger"
        onConfirm={confirmDeletePlan}
        onCancel={() => setPlanToDelete(null)}
      />
    </div>
  );
}
