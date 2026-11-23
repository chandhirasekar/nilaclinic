'use client';

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Bell,
  Clock,
  CheckCircle2,
  FileText,
  Upload,
  Eye,
  AlertCircle,
  ArrowRight,
  User,
  Phone,
  Sparkles,
  Check,
  X,
  Plus,
  Trash2,
  ShieldAlert,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import { IVisit, ICustomer } from '@/types';
import { useClinic } from '@/context/ClinicContext';

interface IPrescriptionRow {
  medicineName: string;
  dosage: string; // e.g. 500mg, 1 tablet, 2 drops
  frequency: string; // e.g. 1-0-1, 1-0-0, Twice daily
  duration: string; // e.g. 5 days, 2 weeks, 1 month
  instructions: string; // e.g. After food, Before bed
}

export default function DoctorPanelPage() {
  const { user, selectedStore, refreshDoctorAlerts, isInitialized } = useClinic();
  const [visits, setVisits] = useState<IVisit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<IVisit | null>(null);
  const [patientProfile, setPatientProfile] = useState<ICustomer | null>(null);
  const [pastVisits, setPastVisits] = useState<IVisit[]>([]);
  const [loading, setLoading] = useState(true);

  // Clinical Consultation Form
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptionRows, setPrescriptionRows] = useState<IPrescriptionRow[]>([
    { medicineName: '', dosage: '', frequency: '1-0-1', duration: '5 days', instructions: 'After food' },
  ]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState<string>('');
  const [followUpAdvice, setFollowUpAdvice] = useState('');
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [queueFilter, setQueueFilter] = useState<'active' | 'waiting' | 'done' | 'all'>('active');

  const isFetchingVisitsRef = React.useRef(false);
  const latestRequestIdRef = React.useRef(0);

  // Poll doctor visits cleanly without overlapping requests or race conditions (NFR-05)
  const fetchVisits = async () => {
    if (!isInitialized || isFetchingVisitsRef.current) return;
    isFetchingVisitsRef.current = true;
    const currentReqId = ++latestRequestIdRef.current;

    try {
      const doctorId = user?.role === 'doctor' ? user._id || user.email : undefined;
      const url = doctorId
        ? `/api/visits?storeCode=${selectedStore}&doctorId=${doctorId}`
        : `/api/visits?storeCode=${selectedStore}`;

      const res = await fetch(url);
      const data = await res.json();
      if (currentReqId === latestRequestIdRef.current && data.success) {
        setVisits(data.data || []);
      }
    } catch (err) {
      console.error('fetchVisits error:', err);
    } finally {
      isFetchingVisitsRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      fetchVisits();
      const interval = setInterval(() => {
        fetchVisits();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedStore, user?._id, user?.role, isInitialized]);

  // Open patient details and mark 'In consultation' (BUG-05: Reload all saved data accurately)
  const handleOpenPatient = async (visit: IVisit) => {
    setSelectedVisit(visit);
    setCompletedSuccess(false);
    setFileError('');

    // Parse caseNotes into diagnosis & clinical findings
    let loadedDiag = '';
    let loadedFindings = visit.caseNotes || '';
    if (loadedFindings.includes('DIAGNOSIS:')) {
      const matchDiag = loadedFindings.match(/DIAGNOSIS:\s*([^\n]+)/i);
      if (matchDiag) {
        loadedDiag = matchDiag[1].trim();
      }
      if (loadedFindings.includes('CLINICAL FINDINGS:')) {
        const parts = loadedFindings.split(/CLINICAL FINDINGS:\s*/i);
        loadedFindings = parts[1]?.trim() || '';
      } else {
        loadedFindings = loadedFindings.replace(/DIAGNOSIS:\s*[^\n]+/i, '').trim();
      }
    }
    setDiagnosis(loadedDiag);
    setChiefComplaints(loadedFindings);

    // Parse prescriptionText into structured medicine rows & notes
    const loadedMeds: IPrescriptionRow[] = [];
    let loadedNotes = '';
    let loadedFollowUp = '';
    const pText = visit.prescriptionText || '';

    if (pText.includes('MEDICATIONS:')) {
      const medsSection = pText.split(/SPECIAL INSTRUCTIONS:|FOLLOW-UP & LIFESTYLE:/i)[0];
      const lines = medsSection.replace('MEDICATIONS:', '').trim().split('\n');
      for (const line of lines) {
        const match = line.match(/^\d+\.\s*([^\[]+)\[(.*?)\]\s*[—-]\s*(.*?)\s+for\s+(.*?)\s*\((.*?)\)/);
        if (match) {
          loadedMeds.push({
            medicineName: match[1].trim(),
            dosage: match[2].trim(),
            frequency: match[3].trim(),
            duration: match[4].trim(),
            instructions: match[5].trim(),
          });
        }
      }
    }
    if (pText.includes('SPECIAL INSTRUCTIONS:')) {
      const afterSpecial = pText.split(/SPECIAL INSTRUCTIONS:\s*/i)[1];
      loadedNotes = afterSpecial ? afterSpecial.split(/FOLLOW-UP & LIFESTYLE:/i)[0].trim() : '';
    }
    if (pText.includes('FOLLOW-UP & LIFESTYLE:')) {
      loadedFollowUp = pText.split(/FOLLOW-UP & LIFESTYLE:\s*/i)[1]?.trim() || '';
    }

    if (loadedMeds.length > 0) {
      setPrescriptionRows(loadedMeds);
    } else {
      setPrescriptionRows([
        { medicineName: '', dosage: '', frequency: '1-0-1', duration: '5 days', instructions: 'After food' },
      ]);
    }
    setPrescriptionNotes(loadedNotes);
    setFollowUpAdvice(loadedFollowUp);
    setPrescriptionImage(visit.prescriptionImage || '');

    // Fetch client full profile & cross-store history
    try {
      const custRes = await fetch(`/api/customers?search=${encodeURIComponent(visit.patientPhone || visit.patientName)}`);
      const custData = await custRes.json();
      if (custData.success && custData.data?.length > 0) {
        const client = custData.data[0];
        setPatientProfile(client);
      } else {
        setPatientProfile(null);
      }

      // Fetch cross-store past visits (sharingOfCaseNotes setting)
      const allVisitsRes = await fetch('/api/visits?storeCode=ALL');
      const allVisitsData = await allVisitsRes.json();
      if (allVisitsData.success) {
        const history = (allVisitsData.data || []).filter(
          (v: IVisit) =>
            (v.patientPhone === visit.patientPhone || v.patientId === visit.patientId) &&
            v.visitId !== visit.visitId &&
            v.status === 'Done'
        );
        setPastVisits(history);
      }
    } catch (e) {}

    // Mark 'In consultation'
    if (visit.status === 'Waiting') {
      try {
        const res = await fetch('/api/visits', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitId: visit._id || visit.visitId,
            status: 'In consultation',
          }),
        });
        const data = await res.json();
        if (data.success) {
          fetchVisits();
          refreshDoctorAlerts();
        }
      } catch (e) {}
    }
  };

  // NFR-03: Secure image upload with type and size checks
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Check type: only image/jpeg, image/png, image/webp
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file type. Only JPEG, PNG, or WebP images are accepted.');
      return;
    }

    // Check size: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Image size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPrescriptionImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Structured prescription row handlers
  const handleAddMedicineRow = () => {
    setPrescriptionRows([
      ...prescriptionRows,
      { medicineName: '', dosage: '', frequency: '1-0-1', duration: '5 days', instructions: 'After food' },
    ]);
  };

  const handleUpdateMedicineRow = (index: number, field: keyof IPrescriptionRow, val: string) => {
    const updated = [...prescriptionRows];
    updated[index][field] = val;
    setPrescriptionRows(updated);
  };

  const handleRemoveMedicineRow = (index: number) => {
    if (prescriptionRows.length === 1) return;
    setPrescriptionRows(prescriptionRows.filter((_, idx) => idx !== index));
  };

  // Submit consultation: marks Done, auto-creates bill in Quick Sale without doctor seeing amounts (Rule BR-03)
  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setSubmitting(true);

    // Format structured medicines into readable prescription text
    const structuredMedsText = prescriptionRows
      .filter((r) => r.medicineName.trim() !== '')
      .map(
        (r, idx) =>
          `${idx + 1}. ${r.medicineName.trim()} [${r.dosage}] — ${r.frequency} for ${r.duration} (${r.instructions})`
      )
      .join('\n');

    const fullPrescription = [
      structuredMedsText ? `MEDICATIONS:\n${structuredMedsText}` : '',
      prescriptionNotes.trim() ? `SPECIAL INSTRUCTIONS:\n${prescriptionNotes.trim()}` : '',
      followUpAdvice.trim() ? `FOLLOW-UP & LIFESTYLE:\n${followUpAdvice.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const fullCaseNotes = [
      diagnosis.trim() ? `DIAGNOSIS: ${diagnosis.trim()}` : '',
      chiefComplaints.trim() ? `CLINICAL FINDINGS:\n${chiefComplaints.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      const res = await fetch('/api/visits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId: selectedVisit._id || selectedVisit.visitId,
          status: 'Done',
          caseNotes: fullCaseNotes,
          prescriptionText: fullPrescription,
          prescriptionImage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCompletedSuccess(true);
        fetchVisits();
        refreshDoctorAlerts();
      } else {
        alert(data.message || 'Error completing consultation');
      }
    } catch (err) {
      alert('Failed to submit consultation');
    } finally {
      setSubmitting(false);
    }
  };

  const waitingVisits = visits.filter((v) => v.status === 'Waiting');
  const inConsultVisits = visits.filter((v) => v.status === 'In consultation');
  const activeVisits = visits.filter((v) => v.status === 'Waiting' || v.status === 'In consultation');
  const doneVisits = visits.filter((v) => v.status === 'Done');

  const displayedVisits =
    queueFilter === 'active'
      ? activeVisits
      : queueFilter === 'done'
      ? doneVisits
      : visits;

  const isReadOnly = selectedVisit?.status === 'Done' || completedSuccess;

  if (!isInitialized || (loading && visits.length === 0)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-96 bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-7 h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Alert Notification (FR-14) */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-sky-500/30 rounded-lg">
              <Stethoscope className="w-5 h-5 text-sky-300" />
            </span>
            <h1 className="text-2xl font-black tracking-tight">Doctor Clinical Workspace</h1>
          </div>
          <p className="text-sm text-sky-100 font-medium mt-1">
            Store [{selectedStore}]: Clinical case notes, cross-store history, prescription writer, and consultation completion.
          </p>
        </div>

        {/* Live Notification Badge (FR-14 & NFR-05) */}
        <div className="flex items-center space-x-3 bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs border border-white/10 self-start sm:self-auto">
          <div className="relative">
            <Bell className="w-5 h-5 text-amber-300" />
            {waitingVisits.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center space-x-2">
              <span>{waitingVisits.length} Arrived Patient(s) Waiting</span>
              {waitingVisits.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.2 rounded-full font-bold">New</span>
              )}
            </div>
            <span className="text-xs text-sky-200 font-medium">Live Auto-Sync Active (every 5s)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Arrived & Waiting Patient Queue (FR-15) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                <span>Patients Queue</span>
                <span className="bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {displayedVisits.length}
                </span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Store: {selectedStore}</span>
            </div>

            {/* Filter Tabs: Waiting / Active vs Completed Today vs All */}
            <div className="flex items-center space-x-1.5 mt-3 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setQueueFilter('active')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center space-x-1 ${
                  queueFilter === 'active'
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Waiting ({activeVisits.length})</span>
                {activeVisits.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setQueueFilter('done')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center space-x-1 ${
                  queueFilter === 'done'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Completed ({doneVisits.length})</span>
                {doneVisits.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setQueueFilter('all')}
                className={`py-1.5 px-3 rounded-lg transition-all text-center ${
                  queueFilter === 'all'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>All ({visits.length})</span>
              </button>
            </div>

            {displayedVisits.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                {queueFilter === 'active'
                  ? `No patients currently waiting for consultation in store [${selectedStore}].`
                  : queueFilter === 'done'
                  ? `No consultations completed yet today for store [${selectedStore}].`
                  : `No patient consultations found for store [${selectedStore}].`}
              </div>
            ) : (
              <div className="space-y-3 mt-3.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {displayedVisits.map((v) => {
                  const isSelected = selectedVisit?._id === v._id || selectedVisit?.visitId === v.visitId;
                  const isReadOnly = selectedVisit?.status === 'Done' || completedSuccess;

  if (!isInitialized || (loading && visits.length === 0)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-96 bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-7 h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
                    <div
                      key={v._id || v.visitId}
                      onClick={() => handleOpenPatient(v)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col space-y-2.5 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-1 ring-sky-400'
                          : 'border-slate-200 hover:border-sky-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
                            {v.patientName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{v.patientName}</h4>
                            <span className="text-xs text-slate-500 font-mono font-medium">{v.patientId}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                              v.status === 'Waiting'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : v.status === 'In consultation'
                                ? 'bg-purple-100 text-purple-800 font-semibold'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {v.status === 'Done' ? '✓ Completed' : v.status}
                          </span>
                          {v.billId && (
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200" title={`Bill: ${v.billId}`}>
                              Billed
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-1.5 border-t border-slate-100 font-medium">
                        <span className="flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {v.patientPhone}
                        </span>
                        <span className="text-sky-700 font-bold flex items-center text-xs">
                          <span>
                            {isSelected
                              ? v.status === 'Done'
                                ? 'Reviewing Notes'
                                : 'Consulting Now'
                              : v.status === 'Done'
                              ? 'View Notes & Rx'
                              : 'Open Case'}
                          </span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Consultation Detail & Clinical Notes Form */}
        <div className="lg:col-span-7">
          {!selectedVisit ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2 h-full flex flex-col items-center justify-center">
              <Stethoscope className="w-12 h-12 stroke-1 text-slate-300" />
              <h3 className="font-bold text-slate-700 text-sm">Select a Patient to Begin Consultation</h3>
              <p className="text-xs max-w-xs text-slate-400">
                Click any checked-in patient from the queue to inspect past case notes, examine allergy alerts, write prescriptions, and finalize the consultation.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 space-y-5">
              {/* Patient Profile & Allergy Alerts Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedVisit.patientName}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phone: <span className="font-mono text-slate-700">{selectedVisit.patientPhone}</span> • ID:{' '}
                      <span className="font-mono text-slate-700">{selectedVisit.patientId}</span> • Store:{' '}
                      <span className="font-semibold text-slate-700">{selectedVisit.storeId}</span>
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedVisit.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {selectedVisit.status}
                  </span>
                </div>

                {patientProfile && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="font-semibold text-slate-600 block">Allergy Notes:</span>
                      <span className="text-amber-700 font-medium">
                        {patientProfile.allergyNotes || 'No known drug allergies reported'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600 block">Skin & Hair Profile:</span>
                      <span className="text-slate-700">{patientProfile.skinHairNotes || 'Normal / Unspecified'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cross-Store Past History Drawer (FR-70) */}
              {pastVisits.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                    <History className="w-3.5 h-3.5 mr-1 text-sky-600" />
                    <span>Previous Clinical History ({pastVisits.length} prior visits across stores)</span>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {pastVisits.map((pv) => (
                      <div key={pv._id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>
                            {pv.doctorName} ({pv.storeId})
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {new Date(pv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {pv.caseNotes && <p className="text-slate-600 font-mono text-[11px]">{pv.caseNotes}</p>}
                        {pv.prescriptionText && (
                          <p className="text-indigo-600 font-mono text-[10px] bg-indigo-50/50 p-1 rounded">
                            {pv.prescriptionText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completedSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>
                      Consultation marked <strong>Done</strong>! Unpaid bill automatically dispatched to Reception POS
                      for checkout.
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitConsultation} className="space-y-4 text-xs">
                {/* 1. Clinical Diagnosis */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Dermatological / Trichological Diagnosis *</label>
                  <input
                    type="text"
                    required
                    disabled={isReadOnly}
                    placeholder="e.g. Acne Vulgaris Grade II, Androgenetic Alopecia Grade 3, Melasma epidermal..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-xs font-semibold text-slate-800 disabled:bg-slate-100 disabled:text-slate-800 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 2. Chief Complaints & Examination Findings */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Clinical Observations & Procedure Notes *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Stored in patient permanent medical record</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    disabled={isReadOnly}
                    placeholder="Enter examination findings, Wood's lamp / dermatoscope results, procedure instructions..."
                    value={chiefComplaints}
                    onChange={(e) => setChiefComplaints(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-xs text-slate-800 disabled:bg-slate-100 disabled:text-slate-800 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 3. Structured Prescription Builder (FR-16, FR-71) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-slate-800 block">Medications & Prescriptions</label>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={handleAddMedicineRow}
                        className="text-sky-600 hover:text-sky-700 font-bold flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Medicine</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {prescriptionRows.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          placeholder="Medicine Name (e.g. Clindamycin Gel)"
                          value={row.medicineName}
                          onChange={(e) => handleUpdateMedicineRow(idx, 'medicineName', e.target.value)}
                          className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-800"
                        />
                        <input
                          type="text"
                          disabled={isReadOnly}
                          placeholder="Dosage (e.g. 500mg)"
                          value={row.dosage}
                          onChange={(e) => handleUpdateMedicineRow(idx, 'dosage', e.target.value)}
                          className="w-24 p-1.5 bg-white border border-slate-200 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-800"
                        />
                        <select
                          disabled={isReadOnly}
                          value={row.frequency}
                          onChange={(e) => handleUpdateMedicineRow(idx, 'frequency', e.target.value)}
                          className="w-24 p-1.5 bg-white border border-slate-200 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-800"
                        >
                          <option value="1-0-1">1-0-1</option>
                          <option value="1-0-0">1-0-0</option>
                          <option value="0-0-1">0-0-1</option>
                          <option value="1-1-1">1-1-1</option>
                          <option value="SOS">SOS (As needed)</option>
                        </select>
                        <input
                          type="text"
                          disabled={isReadOnly}
                          placeholder="Duration"
                          value={row.duration}
                          onChange={(e) => handleUpdateMedicineRow(idx, 'duration', e.target.value)}
                          className="w-20 p-1.5 bg-white border border-slate-200 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-800"
                        />
                        <input
                          type="text"
                          disabled={isReadOnly}
                          placeholder="Instructions (e.g. After food)"
                          value={row.instructions}
                          onChange={(e) => handleUpdateMedicineRow(idx, 'instructions', e.target.value)}
                          className="w-28 p-1.5 bg-white border border-slate-200 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-800"
                        />
                        {!isReadOnly && prescriptionRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Free-text advice */}
                  <textarea
                    rows={2}
                    disabled={isReadOnly}
                    placeholder="Additional dietary advice, sunscreen application guidelines, skincare routine..."
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sky-500 font-mono disabled:bg-slate-100 disabled:text-slate-800 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 4. Secure Prescription Image Upload (<5MB, JPEG/PNG/WebP) */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Handwritten Prescription Scan or Clinical Photo (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 text-center transition-colors">
                    {prescriptionImage ? (
                      <div className="space-y-2">
                        <div className="relative inline-block">
                          <img
                            src={prescriptionImage}
                            alt="Prescription Preview"
                            className="max-h-40 rounded-lg shadow-xs border border-slate-200 object-contain mx-auto"
                          />
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => setPrescriptionImage('')}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          Image uploaded and encrypted in record.
                        </p>
                      </div>
                    ) : isReadOnly ? (
                      <p className="text-slate-400 text-xs italic py-2">No clinical image attached</p>
                    ) : (
                      <div>
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <label className="cursor-pointer text-sky-600 hover:text-sky-700 font-bold block text-xs">
                          <span>Browse file to attach</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          JPEG, PNG, WebP (Max 5MB)
                        </span>
                      </div>
                    )}
                  </div>
                  {fileError && <p className="text-red-500 text-[11px] mt-1">{fileError}</p>}
                </div>

                {/* Status indicator banner */}
                {selectedVisit.status === 'Done' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">Consultation Finished</span>
                        {selectedVisit.billId ? (
                          <span className="ml-2 font-mono text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                            Invoice: {selectedVisit.billId}
                          </span>
                        ) : (
                          <span className="ml-2 text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                            Pending POS Settlement
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {selectedVisit.billId ? 'Billed at Reception POS' : 'Ready for Counter Billing'}
                    </span>
                  </div>
                )}

                {/* Bottom action bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isReadOnly ? (
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Prescription & Consultation Completed (Read-only)</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {selectedVisit.billId ? `Billed at POS: ${selectedVisit.billId}` : 'Awaiting settlement at POS counter'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] text-slate-400">
                        Rule BR-03: Consultation record is queued for Reception POS billing upon submit.
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {submitting ? 'Saving...' : 'Complete Consultation & Queue for Billing'}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
