'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  Phone,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  X,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { IPatient, IVisit, IUser } from '@/types';
import { useClinic } from '@/context/ClinicContext';
import { useDebounce } from '@/hooks/useDebounce';
import { ButtonLoader } from '@/components/ui/ButtonLoader';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import InfiniteScrollSentinel from '@/components/ui/InfiniteScrollSentinel';
import { canonicalStoreCode } from '@/lib/storeHelpers';

export default function PatientEntryAndQueuePage() {
  const { selectedStore, user, stores } = useClinic();
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [visits, setVisits] = useState<IVisit[]>([]);
  const [doctors, setDoctors] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Registration Form State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regStore, setRegStore] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    age: 26,
    address: '',
    notes: '',
  });

  // Doctor Assignment Form State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatientForAssign, setSelectedPatientForAssign] = useState<IPatient | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [reassignVisitId, setReassignVisitId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patRes, visRes, docRes] = await Promise.all([
        fetch(`/api/patients?storeCode=${selectedStore}&search=${encodeURIComponent(debouncedSearch)}&page=1&limit=10`),
        fetch(`/api/visits?storeCode=${selectedStore}`),
        fetch(`/api/users?storeCode=${selectedStore}&role=doctor&activeOnly=true`),
      ]);

      const patData = await patRes.json();
      const visData = await visRes.json();
      const docData = await docRes.json();

      if (patData.success) {
        setPatients(patData.data || []);
        setPage(1);
        setTotalPatients(patData.pagination?.total ?? (patData.data || []).length);
        setHasMore(Boolean(patData.pagination?.hasMore));
      }
      if (visData.success) setVisits(visData.data);
      if (docData.success) {
        // Enforce BR-01: list only ACTIVE doctors of that store
        const activeDoctors = (docData.data || []).filter((d: IUser) => d.isActive !== false);
        setDoctors(activeDoctors);
        if (activeDoctors.length > 0) {
          setSelectedDoctorId(String(activeDoctors[0]._id || activeDoctors[0].email));
        } else {
          setSelectedDoctorId('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePatients = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(
        `/api/patients?storeCode=${selectedStore}&search=${encodeURIComponent(debouncedSearch)}&page=${nextPage}&limit=10`
      );
      const patData = await res.json();
      if (patData.success) {
        const incoming: IPatient[] = patData.data || [];
        setPatients((prev) => {
          const seen = new Set(prev.map((p) => p._id || p.patientId));
          return [...prev, ...incoming.filter((p) => !seen.has(p._id || p.patientId))];
        });
        setPage(nextPage);
        setTotalPatients(patData.pagination?.total ?? totalPatients);
        setHasMore(Boolean(patData.pagination?.hasMore));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStore, debouncedSearch]);

  // Keep selectedDoctorId in sync with current store's active doctors
  useEffect(() => {
    if (doctors.length > 0) {
      const exists = doctors.some(d => String(d._id) === selectedDoctorId || d.email === selectedDoctorId);
      if (!exists) {
        setSelectedDoctorId(String(doctors[0]._id || doctors[0].email));
      }
    } else {
      setSelectedDoctorId('');
    }
  }, [doctors, selectedStore]);

  // Real-time duplicate phone check (FR-10: Debounced by 400ms to prevent hammering serverless functions)
  const debouncedPhone = useDebounce(regForm.phone, 400);

  useEffect(() => {
    const phoneVal = (debouncedPhone || '').trim();
    if (phoneVal.length >= 10) {
      fetch(`/api/patients?storeCode=${selectedStore}&checkPhone=${encodeURIComponent(phoneVal)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.isDuplicate) {
            setDuplicateWarning(
              `Alert: Patient "${data.duplicatePatient?.name}" with phone ${phoneVal} is already registered (${data.duplicatePatient?.patientId})!`
            );
          } else {
            setDuplicateWarning(null);
          }
        })
        .catch(() => {});
    } else {
      setDuplicateWarning(null);
    }
  }, [debouncedPhone, selectedStore]);

  const handlePhoneChange = (phoneVal: string) => {
    setRegForm({ ...regForm, phone: phoneVal });
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReg(true);
    const targetStore = selectedStore === 'ALL' ? (regStore || stores[0]?.code || 'NILA-TH') : selectedStore;
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regForm,
          storeId: targetStore,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRegModal(false);
        setRegForm({ name: '', phone: '', email: '', gender: 'Female', age: 26, address: '', notes: '' });
        setDuplicateWarning(null);
        await loadData();

        // Prompt to assign doctor immediately
        setSelectedPatientForAssign(data.data);
        if (doctors.length > 0) {
          setSelectedDoctorId(String(doctors[0]._id || doctors[0].email));
        }
        setReassignVisitId(null);
        setAssignError('');
        setShowAssignModal(true);
      } else {
        alert(data.message || 'Error creating patient');
      }
    } catch (err) {
      alert('Failed to register patient');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleAssignDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError('');

    if (!selectedPatientForAssign) return;

    const matchedDoctor = doctors.find(
      (d) => String(d._id) === selectedDoctorId || d.email === selectedDoctorId
    );
    const chosenDoctor = matchedDoctor || (doctors.length > 0 ? doctors[0] : null);
    const activeDocId = chosenDoctor ? String(chosenDoctor._id || chosenDoctor.email) : '';
    const activeDocName = chosenDoctor ? chosenDoctor.name : '';

    if (!activeDocId) {
      setAssignError(`No active doctor available for store [${selectedStore}]. Please assign a doctor in Users & Roles.`);
      return;
    }

    const targetPatientId =
      selectedPatientForAssign.patientId ||
      (selectedPatientForAssign as any).customerId ||
      selectedPatientForAssign._id;
    const targetPhone =
      selectedPatientForAssign.phone ||
      (selectedPatientForAssign as any).mobile ||
      '';

    setIsSubmittingAssign(true);
    try {
      if (reassignVisitId) {
        // REASSIGN: Only reassign the existing visit — DO NOT create another visit!
        const res = await fetch('/api/visits', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitId: reassignVisitId,
            doctorId: activeDocId,
            doctorName: activeDocName,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowAssignModal(false);
          setSelectedPatientForAssign(null);
          setReassignVisitId(null);
          await loadData();
        } else {
          setAssignError(data.message || 'Failed to reassign doctor');
        }
      } else {
        // ASSIGN NEW VISIT
        const targetStoreCode = selectedStore === 'ALL' ? (chosenDoctor?.assignedStoreIds?.[0] || 'NILA-TH') : selectedStore;
        const res = await fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: targetPatientId,
            patientName: selectedPatientForAssign.name,
            patientPhone: targetPhone,
            storeId: targetStoreCode,
            doctorId: activeDocId,
            doctorName: activeDocName,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowAssignModal(false);
          setSelectedPatientForAssign(null);
          setReassignVisitId(null);
          await loadData();
        } else {
          setAssignError(data.message || 'Failed to assign doctor');
        }
      }
    } catch (err: any) {
      setAssignError(err.message || 'Error occurred');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Patient Entry & Live Clinic Queue</h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Store [{selectedStore}]: Register patients (duplicate phone flag), assign store doctors, and track visit status.
          </p>
        </div>
        <button
          onClick={() => setShowRegModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Live Visit Queue Section (FR-13: Waiting, In consultation, Done) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h2 className="font-black text-slate-900 text-base">Today&apos;s Patient Queue ({visits.length})</h2>
          </div>
          <span className="text-xs sm:text-sm text-slate-600 font-medium">Live Status: Waiting → In consultation → Done</span>
        </div>

        {visits.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No patients currently queued for consultation in store [{selectedStore}].
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Waiting Column */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm font-black text-amber-950 border-b border-amber-200/60 pb-2">
                <span>Waiting for Doctor</span>
                <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {visits.filter((v) => v.status === 'Waiting').length}
                </span>
              </div>
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {visits
                  .filter((v) => v.status === 'Waiting')
                  .map((v) => (
                    <div key={v._id || v.visitId} className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-slate-900">{v.patientName}</span>
                        <span className="text-xs font-mono font-bold text-slate-500">{v.patientId}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {v.patientPhone}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex flex-col">
                          <span className="text-sky-800 font-semibold text-[11px] truncate max-w-[140px]">
                            Dr: {v.doctorName}
                          </span>
                          <span className="text-amber-700 font-bold text-[10px]">Waiting</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPatientForAssign({
                              name: v.patientName,
                              patientId: v.patientId,
                              phone: v.patientPhone,
                            } as any);
                            setSelectedDoctorId(String(v.doctorId || ''));
                            setReassignVisitId(String(v._id || v.visitId));
                            setAssignError('');
                            setShowAssignModal(true);
                          }}
                          className="px-2 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-all cursor-pointer inline-flex items-center space-x-1"
                          title="Reassign doctor without creating another visit"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Reassign</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* In Consultation Column */}
            <div className="bg-sky-50/60 border border-sky-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm font-black text-sky-950 border-b border-sky-200/60 pb-2">
                <span>In Consultation</span>
                <span className="bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {visits.filter((v) => v.status === 'In consultation').length}
                </span>
              </div>
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {visits
                  .filter((v) => v.status === 'In consultation')
                  .map((v) => (
                    <div key={v._id || v.visitId} className="bg-white p-3.5 rounded-xl border border-sky-100 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-slate-900">{v.patientName}</span>
                        <span className="text-xs font-mono font-bold text-slate-500">{v.patientId}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{v.doctorName} is examining patient...</p>
                      <span className="inline-block text-xs bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-md font-bold animate-pulse">
                        Exam in progress
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Done / Sent to Billing Column */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm font-black text-emerald-950 border-b border-emerald-200/60 pb-2">
                <span>Done (Sent to Billing)</span>
                <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {visits.filter((v) => v.status === 'Done').length}
                </span>
              </div>
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {visits
                  .filter((v) => v.status === 'Done')
                  .map((v) => (
                    <div key={v._id || v.visitId} className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-slate-900">{v.patientName}</span>
                        {v.billId ? (
                          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">✓ Billed</span>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">Consultation Done – Pending Billing</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 font-medium">Dr. Notes: {v.caseNotes || 'Completed'}</p>
                      <div className="pt-1.5 flex items-center justify-between">
                        <a
                          href="/admin/pos"
                          className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Collect Bill at POS →</span>
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Directory & Search (FR-11) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Mobile, Name, or Patient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            />
          </div>
          <span className="text-sm text-slate-600 font-medium">
            Registered Patients in [{selectedStore}]: <strong className="text-slate-900 font-bold">{totalPatients || patients.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Gender / Age</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Assigned Doctor</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Doctor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && patients.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-12" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                    <td className="px-4 py-3 text-right"><div className="h-6 bg-slate-200 rounded-lg w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No patients registered yet. Click &quot;Register Patient&quot; above.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const pid = p.patientId || (p as any).customerId || p._id;
                  const contact = p.phone || (p as any).mobile || '-';
                  const rawPhone = p.phone || (p as any).mobile || '';

                  // Find active visit in Waiting or In consultation, or latest completed visit
                  const activeVisit = visits.find(
                    (v) =>
                      (v.patientId === pid || (rawPhone && v.patientPhone === rawPhone)) &&
                      (v.status === 'Waiting' || v.status === 'In consultation')
                  );
                  const doneVisit = !activeVisit
                    ? visits.find(
                        (v) =>
                          (v.patientId === pid || (rawPhone && v.patientPhone === rawPhone)) &&
                          v.status === 'Done'
                      )
                    : null;

                  return (
                    <tr key={p._id || pid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{pid}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{contact}</td>
                      <td className="px-4 py-3">{p.gender} / {p.age || '-'} yrs</td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                          {canonicalStoreCode(p.storeId || (p as any).firstStoreId || selectedStore)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {activeVisit ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                              <Stethoscope className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span className="truncate max-w-[150px]">{activeVisit.doctorName}</span>
                            </div>
                            {activeVisit.status === 'Waiting' ? (
                              <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded">
                                Waiting in Queue
                              </span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded animate-pulse">
                                In Consultation
                              </span>
                            )}
                          </div>
                        ) : doneVisit ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-700">
                              <Stethoscope className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[150px]">{doneVisit.doctorName}</span>
                            </div>
                            <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                              Consultation Done
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span>Not Assigned</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{p.notes || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        {activeVisit ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientForAssign({
                                ...p,
                                patientId: pid,
                                phone: rawPhone,
                              });
                              setSelectedDoctorId(String(activeVisit.doctorId || (doctors[0]?._id || doctors[0]?.email || '')));
                              setReassignVisitId(String(activeVisit._id || activeVisit.visitId));
                              setAssignError('');
                              setShowAssignModal(true);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs shadow-2xs transition-all inline-flex items-center space-x-1 cursor-pointer"
                            title="Reassign to another active doctor (no duplicate visit created)"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Reassign</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientForAssign({
                                ...p,
                                patientId: pid,
                                phone: rawPhone,
                              });
                              if (doctors.length > 0) {
                                setSelectedDoctorId(String(doctors[0]._id || doctors[0].email));
                              }
                              setReassignVisitId(null);
                              setAssignError('');
                              setShowAssignModal(true);
                            }}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all inline-flex items-center space-x-1 cursor-pointer"
                            title="Assign doctor for consultation"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Assign Doctor</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }))}
            </tbody>
          </table>
        </div>
        <InfiniteScrollSentinel
          hasMore={hasMore}
          isLoading={loadingMore}
          onLoadMore={loadMorePatients}
          visibleCount={patients.length}
          totalCount={totalPatients}
          itemLabel="patients"
        />
      </div>

      {/* Registration Modal with Duplicate Warning (FR-10) */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <h3 className="font-bold text-slate-900 text-base mb-1">Patient Registration</h3>
            {selectedStore === 'ALL' ? (
              <div className="mb-3">
                <label className="block font-semibold text-slate-700 mb-1">Registration Branch *</label>
                <select
                  value={regStore || stores[0]?.code || 'NILA-TH'}
                  onChange={(e) => setRegStore(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  {stores.map((st) => (
                    <option key={st.code} value={st.code}>
                      [{st.code}] {(st.name || '').replace('Nila Clinic - ', '')}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mb-3">Register new patient for clinic store [{selectedStore}].</p>
            )}

            {duplicateWarning && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavya Sundaram"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 00000"
                    value={regForm.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="patient@gmail.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={regForm.gender}
                    onChange={(e) => setRegForm({ ...regForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={regForm.age}
                    onChange={(e) => setRegForm({ ...regForm, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="City, Area"
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient History / Symptoms</label>
                <textarea
                  placeholder="Primary complaint, skin issues, allergies, etc."
                  value={regForm.notes}
                  onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-16"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <ButtonLoader
                  type="submit"
                  isLoading={isSubmittingReg}
                  loadingText="Saving & Registering..."
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save & Continue to Doctor
                </ButtonLoader>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Assignment Modal (FR-12 & BR-01) */}
      {showAssignModal && selectedPatientForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              {reassignVisitId ? 'Reassign Doctor' : 'Assign Doctor'}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              {reassignVisitId
                ? 'Update assigned doctor for the active visit without creating a duplicate record.'
                : `FR-12: Assign only active doctors belonging to store [${selectedStore}].`}
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 text-xs space-y-0.5">
              <p><strong>Patient:</strong> {selectedPatientForAssign.name}</p>
              <p><strong>Phone:</strong> {selectedPatientForAssign.phone || (selectedPatientForAssign as any).mobile || 'N/A'}</p>
              <p><strong>ID:</strong> {selectedPatientForAssign.patientId || (selectedPatientForAssign as any).customerId || selectedPatientForAssign._id}</p>
            </div>

            {assignError && (
              <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-xs">{assignError}</div>
            )}

            <form onSubmit={handleAssignDoctor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Active Doctor at [{selectedStore}] *
                </label>
                {doctors.length === 0 ? (
                  <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs">
                    No active doctors assigned to store [{selectedStore}]. Please assign a doctor to this store in Users & Roles.
                  </div>
                ) : (
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
                  >
                    {doctors.map((doc) => (
                      <option key={String(doc._id || doc.email)} value={String(doc._id || doc.email)}>
                        {doc.name} {doc.specialization ? `(${doc.specialization})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setReassignVisitId(null);
                  }}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <ButtonLoader
                  type="submit"
                  isLoading={isSubmittingAssign}
                  loadingText={reassignVisitId ? "Reassigning..." : "Placing in Queue..."}
                  disabled={doctors.length === 0}
                  className={`px-5 py-2 text-white font-semibold rounded-xl shadow-xs disabled:opacity-50 ${
                    reassignVisitId
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                >
                  {reassignVisitId ? 'Save & Reassign Doctor' : 'Place in Waiting Queue'}
                </ButtonLoader>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
