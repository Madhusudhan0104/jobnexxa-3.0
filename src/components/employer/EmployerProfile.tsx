import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Edit3,
  Hammer,
  Mail,
  MapPin,
  Phone,
  Share2,
  Star,
  Users,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const EmployerProfileView: React.FC = () => {
  const {
    currentEmployer,
    setRole,
    updateEmployerProfile,
    jobs,
    reviews,
    showToast,
    logout,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentEmployer.name);
  const [businessType, setBusinessType] = useState(currentEmployer.businessType);
  const [area, setArea] = useState(currentEmployer.area);
  const [contactPerson, setContactPerson] = useState(currentEmployer.contactPerson);
  const [phone, setPhone] = useState(currentEmployer.phone);
  const [email, setEmail] = useState(currentEmployer.email);
  const [description, setDescription] = useState(currentEmployer.description);

  // Reviews received from workers
  const employerReviews = reviews.filter((r) => r.targetId === currentEmployer.id);
  const employerJobs = jobs.filter((j) => j.employerId === currentEmployer.id);

  const handleSave = () => {
    updateEmployerProfile(currentEmployer.id, {
      name,
      businessType,
      area,
      contactPerson,
      phone,
      email,
      description,
    });
    setIsEditing(false);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Employer profile link copied to clipboard!');
  };

  return (
    <div className="space-y-4 pb-6">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <img
            src={currentEmployer.logo}
            alt={currentEmployer.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-orange-500/80 shadow-md"
            referrerPolicy="no-referrer"
          />

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {currentEmployer.name}
              </h1>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Verified Business
              </span>
            </div>

            <p className="text-xs text-orange-600 font-semibold">
              {currentEmployer.businessType}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {currentEmployer.area}, {currentEmployer.city}
              </span>
              <span>·</span>
              <span className="flex items-center font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 mr-0.5" />
                {currentEmployer.rating} ({currentEmployer.reviewCount} Worker Reviews)
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {employerJobs.length} Jobs Posted
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                {currentEmployer.phone || '+91 98450 00000'}
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>

              <button
                onClick={() => setRole('worker')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/60 transition-colors cursor-pointer"
                title="Switch to Worker Account"
              >
                <Hammer className="w-3.5 h-3.5" />
                Switch to Worker Mode
              </button>

              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white rounded-2xl p-5 border-2 border-orange-400/80 shadow-md space-y-4 animate-in fade-in duration-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-orange-500" />
            Edit Employer Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company / Entity Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Business Category</label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Area / Neighborhood</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Business Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Description & Contact Details */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900">About the Business</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {currentEmployer.description}
        </p>

        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Contact Person: <strong>{currentEmployer.contactPerson}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>Phone: <strong>{currentEmployer.phone}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Email: <strong>{currentEmployer.email}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Headquarters: <strong>{currentEmployer.area}, Bangalore</strong></span>
          </div>
        </div>
      </div>

      {/* Reviews Received from Workers */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            Worker Ratings & Feedback ({employerReviews.length})
          </h2>
          <span className="text-xs font-bold text-slate-700">
            Average {currentEmployer.rating} / 5.0
          </span>
        </div>

        {employerReviews.length === 0 ? (
          <p className="text-xs text-slate-400">No worker reviews on file yet.</p>
        ) : (
          <div className="space-y-3">
            {employerReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {rev.reviewerName}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Job: {rev.jobTitle} · {rev.date}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
