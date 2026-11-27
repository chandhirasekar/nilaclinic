import { NextResponse } from 'next/server';
import clinicService, { getLocalDateString } from '@/lib/clinicService';

function parseHour24(timeStr?: string): string | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:00`;
}

function toLocalYMD(createdStr?: string | Date, dateStr?: string): string {
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }
  if (!createdStr) return '';
  const d = new Date(createdStr);
  if (isNaN(d.getTime())) return '';
  return getLocalDateString(d);
}

function normalizeDoctorName(name?: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/^dr\.\s*/i, '')
    .trim();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || 'ALL';
    const dateRange = searchParams.get('dateRange') || 'today'; // 'today' | 'yesterday' | 'week' | 'month' | 'last30' | 'custom'
    const customDate = searchParams.get('customDate') || undefined;
    const startDateParam = searchParams.get('startDate') || undefined;
    const endDateParam = searchParams.get('endDate') || undefined;

    const targetStore = storeCode !== 'ALL' ? storeCode.toUpperCase() : undefined;

    // Fetch baseline data scoped to targetStore + shared active doctors query (BUG-02)
    const [allInvoices, allVisits, activeDoctors, allAppointments, allStores] = await Promise.all([
      clinicService.getInvoices(targetStore, undefined, { limit: 5000 }),
      clinicService.getVisits(targetStore),
      clinicService.getActiveDoctors(targetStore),
      clinicService.getAppointments(targetStore),
      clinicService.getStores(),
    ]);

    // Calculate Date Bounds as YYYY-MM-DD strings in local calendar
    const now = new Date();
    const todayYMD = getLocalDateString(now);

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayYMD = getLocalDateString(yesterdayDate);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // Monday start
    const weekStartYMD = getLocalDateString(startOfWeek);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartYMD = getLocalDateString(startOfMonth);

    const last30Start = new Date(now);
    last30Start.setDate(now.getDate() - 30);
    const last30StartYMD = getLocalDateString(last30Start);

    const filterDate = (createdStr?: string | Date, dateStr?: string) => {
      const itemYMD = toLocalYMD(createdStr, dateStr);
      if (!itemYMD) return false;

      if (startDateParam && endDateParam) {
        return itemYMD >= startDateParam && itemYMD <= endDateParam;
      }
      if (customDate) {
        return itemYMD === customDate;
      }
      if (dateRange === 'yesterday') {
        return itemYMD === yesterdayYMD;
      }
      if (dateRange === 'today') {
        return itemYMD === todayYMD;
      }
      if (dateRange === 'week') {
        return itemYMD >= weekStartYMD && itemYMD <= todayYMD;
      }
      if (dateRange === 'month') {
        return itemYMD >= monthStartYMD && itemYMD <= todayYMD;
      }
      if (dateRange === 'last30') {
        return itemYMD >= last30StartYMD && itemYMD <= todayYMD;
      }
      return true;
    };

    const periodInvoices = allInvoices.filter(inv => filterDate(inv.createdAt, inv.date));
    const periodVisits = allVisits.filter(v => filterDate(v.createdAt));
    const completedPeriodVisits = allVisits.filter(
      v => v.status === 'Done' && filterDate(v.consultedAt || v.createdAt)
    );
    const periodAppointments = allAppointments.filter(a => filterDate(a.createdAt, a.date));

    // Core KPI Metrics (BUG-04, BUG-05, BUG-06: never fall back to all-time counts when period is 0)
    const totalBillsCount = periodInvoices.length;
    const paidInvoices = periodInvoices.filter(i => i.status === 'Paid');
    const unpaidInvoices = periodInvoices.filter(i => i.status === 'Unpaid');

    const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);
    const pendingPayments = unpaidInvoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);

    // 1. Payment Modes Breakdown
    const paymentModeTotals: Record<string, { amount: number; count: number }> = {
      Cash: { amount: 0, count: 0 },
      Card: { amount: 0, count: 0 },
      UPI: { amount: 0, count: 0 },
    };

    paidInvoices.forEach(inv => {
      if (inv.payments && inv.payments.length > 0) {
        inv.payments.forEach(p => {
          const mode = (p.mode || 'Cash') as 'Cash' | 'Card' | 'UPI';
          if (!paymentModeTotals[mode]) paymentModeTotals[mode] = { amount: 0, count: 0 };
          paymentModeTotals[mode].amount += p.amount || 0;
          paymentModeTotals[mode].count += 1;
        });
      } else {
        const mode = (inv.paymentMethod || 'Cash') as 'Cash' | 'Card' | 'UPI';
        if (paymentModeTotals[mode]) {
          paymentModeTotals[mode].amount += inv.grandTotal || 0;
          paymentModeTotals[mode].count += 1;
        } else {
          paymentModeTotals[mode] = { amount: inv.grandTotal || 0, count: 1 };
        }
      }
    });

    const paymentModesChart = [
      { name: 'Cash', value: paymentModeTotals['Cash']?.amount || 0, count: paymentModeTotals['Cash']?.count || 0, color: '#10b981' },
      { name: 'UPI / QR', value: paymentModeTotals['UPI']?.amount || 0, count: paymentModeTotals['UPI']?.count || 0, color: '#6366f1' },
      { name: 'Credit/Debit Card', value: paymentModeTotals['Card']?.amount || 0, count: paymentModeTotals['Card']?.count || 0, color: '#0ea5e9' },
    ];

    // 2. Revenue Stream Category Breakdown: Services vs Products vs Packages
    let serviceRevenue = 0;
    let serviceCount = 0;
    let productRevenue = 0;
    let productCount = 0;
    let packageRevenue = 0;
    let packageCount = 0;

    paidInvoices.forEach(inv => {
      if (inv.items && inv.items.length > 0) {
        inv.items.forEach(it => {
          if (it.type === 'product') {
            productRevenue += it.total || 0;
            productCount += it.quantity || 1;
          } else if (it.type === 'package' || it.type === 'package_use' || it.isFromPackage) {
            packageRevenue += it.total || 0;
            packageCount += it.quantity || 1;
          } else {
            serviceRevenue += it.total || 0;
            serviceCount += it.quantity || 1;
          }
        });
      } else {
        serviceRevenue += inv.grandTotal || 0;
        serviceCount += 1;
      }
    });

    const categoryBreakdown = [
      {
        name: 'Clinical Treatments',
        revenue: serviceRevenue,
        count: serviceCount,
        color: '#059669',
        share: totalRevenue > 0 ? Math.round((serviceRevenue / totalRevenue) * 100) : 0,
      },
      {
        name: 'Retail Products',
        revenue: productRevenue,
        count: productCount,
        color: '#4f46e5',
        share: totalRevenue > 0 ? Math.round((productRevenue / totalRevenue) * 100) : 0,
      },
      {
        name: 'Packages & Sittings',
        revenue: packageRevenue,
        count: packageCount,
        color: '#d97706',
        share: totalRevenue > 0 ? Math.round((packageRevenue / totalRevenue) * 100) : 0,
      },
    ];

    // 3. Client Segmentation: New vs Returning Patients (BUG-06)
    // Scoped to selected store, selected date range, and completed visits only (status === 'Done').
    const completedVisitHistory: Record<string, number> = {};
    allVisits
      .filter(v => v.status === 'Done')
      .forEach(v => {
        const key = (v.patientPhone || v.patientId || v.patientName || '').trim().toLowerCase();
        if (key) completedVisitHistory[key] = (completedVisitHistory[key] || 0) + 1;
      });

    let newPatientsCount = 0;
    let returningPatientsCount = 0;
    const seenPeriodPatients = new Set<string>();

    completedPeriodVisits.forEach(v => {
      const key = (v.patientPhone || v.patientId || v.patientName || '').trim().toLowerCase();
      if (!key || seenPeriodPatients.has(key)) return;
      seenPeriodPatients.add(key);

      const totalCompleted = completedVisitHistory[key] || 1;
      if (totalCompleted <= 1) newPatientsCount += 1;
      else returningPatientsCount += 1;
    });

    const totalClients = newPatientsCount + returningPatientsCount;
    const totalPatientsCount = completedPeriodVisits.length;
    const retentionRate = totalClients > 0 ? Math.round((returningPatientsCount / totalClients) * 100) : 0;
    const newPatientsPct = totalClients > 0 ? Math.round((newPatientsCount / totalClients) * 100) : 0;

    const clientRetention = [
      { name: 'New Patients', value: newPatientsCount, percentage: newPatientsPct, color: '#0284c7' },
      { name: 'Returning Patients', value: returningPatientsCount, percentage: retentionRate, color: '#059669' },
    ];

    // 4. Top Performing Treatments & Services (BUG-04: Strictly real branch data, NO hardcoded defaultServices)
    const serviceTally: Record<string, { name: string; revenue: number; count: number; category: string }> = {};
    const billedPatientServices = new Set<string>();

    paidInvoices.forEach(inv => {
      const invDate = toLocalYMD(inv.createdAt, inv.date);
      const custKey = (inv.customerMobile || inv.customerPhone || inv.customerId || inv.customerName || '').trim().toLowerCase();
      if (inv.items && inv.items.length > 0) {
        inv.items.forEach(it => {
          const name = it.name || 'Clinical Service';
          const category =
            it.type === 'product'
              ? 'Product'
              : it.type === 'package' || it.type === 'package_use' || it.isFromPackage
              ? 'Package'
              : 'Treatment';
          if (!serviceTally[name]) {
            serviceTally[name] = { name, revenue: 0, count: 0, category };
          }
          serviceTally[name].revenue += it.total || 0;
          serviceTally[name].count += it.quantity || 1;
          if (custKey) {
            billedPatientServices.add(`${custKey}|${name.toLowerCase().trim()}|${invDate}`);
          }
        });
      }
    });

    // Include Completed appointments that were not already counted via a paid invoice
    periodAppointments
      .filter(a => a.status === 'Completed')
      .forEach(a => {
        const name = a.serviceName || 'General Consultation';
        const apptDate = toLocalYMD(a.createdAt, a.date);
        const custKey = (a.customerPhone || a.customerId || a.customerName || '').trim().toLowerCase();
        if (custKey && billedPatientServices.has(`${custKey}|${name.toLowerCase().trim()}|${apptDate}`)) {
          return;
        }
        if (!serviceTally[name]) {
          serviceTally[name] = { name, revenue: 0, count: 0, category: 'Treatment' };
        }
        serviceTally[name].count += 1;
        serviceTally[name].revenue += a.amount || 0;
      });

    const topServices = Object.values(serviceTally)
      .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
      .slice(0, 6);

    // 5. Doctor & Specialist Productivity (BUG-02 & BUG-05: Only active doctors of this store, real metrics only)
    const doctorCounts: Record<string, { name: string; visits: number; completed: number; revenue: number }> = {};
    const findActiveDoctorName = (idOrEmail?: string, name?: string): string | null => {
      const idTrim = (idOrEmail || '').trim().toLowerCase();
      const normName = normalizeDoctorName(name);
      const matched = activeDoctors.find(d => {
        const dId = String(d._id || '').trim().toLowerCase();
        const dEmail = (d.email || '').trim().toLowerCase();
        const dNorm = normalizeDoctorName(d.name);
        return (
          (idTrim && (dId === idTrim || dEmail === idTrim)) ||
          (normName && dNorm && dNorm === normName)
        );
      });
      return matched ? matched.name : null;
    };

    activeDoctors.forEach(doc => {
      doctorCounts[doc.name] = { name: doc.name, visits: 0, completed: 0, revenue: 0 };
    });

    const countedVisitKeys = new Set<string>();
    periodVisits.forEach(v => {
      const activeDocName = findActiveDoctorName(v.doctorId, v.doctorName);
      if (!activeDocName || !doctorCounts[activeDocName]) return;

      doctorCounts[activeDocName].visits += 1;
      if (v.status === 'Done') {
        doctorCounts[activeDocName].completed += 1;
      }
      const pKey = (v.patientPhone || v.patientId || v.patientName || '').trim().toLowerCase();
      const vDate = toLocalYMD(v.createdAt);
      if (pKey) countedVisitKeys.add(`${pKey}|${normalizeDoctorName(activeDocName)}|${vDate}`);
    });

    periodAppointments
      .filter(a => a.status !== 'Cancelled' && a.status !== 'No-show')
      .forEach(a => {
        const activeDocName = findActiveDoctorName(a.doctorId || a.staffId, a.doctorName || a.staffName);
        if (!activeDocName || !doctorCounts[activeDocName]) return;

        const pKey = (a.customerPhone || a.customerId || a.customerName || '').trim().toLowerCase();
        const aDate = toLocalYMD(a.createdAt, a.date);
        // Avoid double-counting an appointment that already has a corresponding Visit record
        if (pKey && countedVisitKeys.has(`${pKey}|${normalizeDoctorName(activeDocName)}|${aDate}`)) {
          return;
        }
        doctorCounts[activeDocName].visits += 1;
        if (a.status === 'Completed') {
          doctorCounts[activeDocName].completed += 1;
        }
      });

    // Calculate real revenue per active doctor from paid invoices
    paidInvoices.forEach(inv => {
      if (inv.items && inv.items.length > 0) {
        inv.items.forEach(it => {
          const activeDocName = findActiveDoctorName(undefined, it.staffName || inv.staffName);
          if (activeDocName && doctorCounts[activeDocName]) {
            doctorCounts[activeDocName].revenue += it.total || 0;
          }
        });
      } else {
        const activeDocName = findActiveDoctorName(undefined, inv.staffName);
        if (activeDocName && doctorCounts[activeDocName]) {
          doctorCounts[activeDocName].revenue += inv.grandTotal || 0;
        }
      }
    });

    // 6. Hourly Appointment Distribution & Peak Clinic Hours (BUG-05: Zero when empty, no random numbers)
    const hourlyMap: Record<string, number> = {
      '09:00': 0, '10:00': 0, '11:00': 0, '12:00': 0, '13:00': 0,
      '14:00': 0, '15:00': 0, '16:00': 0, '17:00': 0, '18:00': 0,
      '19:00': 0, '20:00': 0,
    };

    const activePeriodAppts = periodAppointments.filter(
      a => a.status !== 'Cancelled' && a.status !== 'No-show'
    );

    const apptPatientDates = new Set<string>();
    activePeriodAppts.forEach(a => {
      const hour = parseHour24(a.startTime || a.time);
      if (hour && hourlyMap[hour] !== undefined) {
        hourlyMap[hour] += 1;
      }
      const pKey = (a.customerPhone || a.customerId || a.customerName || '').trim().toLowerCase();
      const aDate = toLocalYMD(a.createdAt, a.date);
      if (pKey) apptPatientDates.add(`${pKey}|${aDate}`);
    });

    // Include walk-in consultations from periodVisits that weren't created from an appointment
    periodVisits.forEach(v => {
      const pKey = (v.patientPhone || v.patientId || v.patientName || '').trim().toLowerCase();
      const vDate = toLocalYMD(v.createdAt);
      if (pKey && apptPatientDates.has(`${pKey}|${vDate}`)) return;
      if (!v.createdAt) return;
      const d = new Date(v.createdAt);
      if (isNaN(d.getTime())) return;
      const hour = `${d.getHours().toString().padStart(2, '0')}:00`;
      if (hourlyMap[hour] !== undefined) {
        hourlyMap[hour] += 1;
      }
    });

    const hourlyLoad = Object.entries(hourlyMap).map(([hour, appointments]) => ({
      hour,
      appointments,
    }));

    const topPeak = [...hourlyLoad].sort((a, b) => b.appointments - a.appointments)[0];
    const peakHour =
      topPeak && topPeak.appointments > 0
        ? topPeak
        : { hour: '—', appointments: 0 };

    // 7. Real Sales & Revenue Trajectory Trend (Zero when no paid bills exist)
    let salesTrend: Array<{ day: string; revenue: number; bills: number; cash: number; upi: number; card: number }> = [];

    if (dateRange === 'today' || dateRange === 'yesterday' || (customDate && !startDateParam)) {
      const buckets = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];
      const bucketMap: Record<string, { day: string; revenue: number; bills: number; cash: number; upi: number; card: number }> = {};
      buckets.forEach(b => {
        bucketMap[b] = { day: b, revenue: 0, bills: 0, cash: 0, upi: 0, card: 0 };
      });

      paidInvoices.forEach(inv => {
        const dt = new Date(inv.paidAt || inv.createdAt || Date.now());
        const hr = isNaN(dt.getTime()) ? 11 : dt.getHours();
        const bucketIdx = Math.min(buckets.length - 1, Math.max(0, Math.floor((hr - 9) / 2)));
        const bKey = buckets[bucketIdx];
        bucketMap[bKey].revenue += inv.grandTotal || 0;
        bucketMap[bKey].bills += 1;
        if (inv.payments && inv.payments.length > 0) {
          inv.payments.forEach(p => {
            if (p.mode === 'Cash') bucketMap[bKey].cash += p.amount || 0;
            else if (p.mode === 'UPI') bucketMap[bKey].upi += p.amount || 0;
            else if (p.mode === 'Card') bucketMap[bKey].card += p.amount || 0;
          });
        } else {
          if (inv.paymentMethod === 'Cash') bucketMap[bKey].cash += inv.grandTotal || 0;
          else if (inv.paymentMethod === 'UPI') bucketMap[bKey].upi += inv.grandTotal || 0;
          else if (inv.paymentMethod === 'Card') bucketMap[bKey].card += inv.grandTotal || 0;
        }
      });

      salesTrend = buckets.map(b => bucketMap[b]);
    } else {
      const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayMap: Record<string, { day: string; revenue: number; bills: number; cash: number; upi: number; card: number }> = {};
      daysOrder.forEach(d => {
        dayMap[d] = { day: d, revenue: 0, bills: 0, cash: 0, upi: 0, card: 0 };
      });

      paidInvoices.forEach(inv => {
        const ymd = toLocalYMD(inv.createdAt, inv.date);
        const dt = ymd ? new Date(`${ymd}T12:00:00`) : new Date(inv.createdAt || Date.now());
        const dayLabel = isNaN(dt.getTime()) ? 'Mon' : dayNames[dt.getDay()];
        dayMap[dayLabel].revenue += inv.grandTotal || 0;
        dayMap[dayLabel].bills += 1;
        if (inv.payments && inv.payments.length > 0) {
          inv.payments.forEach(p => {
            if (p.mode === 'Cash') dayMap[dayLabel].cash += p.amount || 0;
            else if (p.mode === 'UPI') dayMap[dayLabel].upi += p.amount || 0;
            else if (p.mode === 'Card') dayMap[dayLabel].card += p.amount || 0;
          });
        } else {
          if (inv.paymentMethod === 'Cash') dayMap[dayLabel].cash += inv.grandTotal || 0;
          else if (inv.paymentMethod === 'UPI') dayMap[dayLabel].upi += inv.grandTotal || 0;
          else if (inv.paymentMethod === 'Card') dayMap[dayLabel].card += inv.grandTotal || 0;
        }
      });

      salesTrend = daysOrder.map(d => dayMap[d]);
    }

    // Appointment summary counts for the selected period
    const appointmentStats = {
      total: periodAppointments.length,
      booked: periodAppointments.filter(a => a.status === 'Booked').length,
      arrived: periodAppointments.filter(a => a.status === 'Arrived').length,
      inService: periodAppointments.filter(a => a.status === 'In consultation').length,
      completed: periodAppointments.filter(a => a.status === 'Completed').length,
    };

    // Branch Breakdown for multi-store (filtered by selected period)
    const storeBreakdown: Record<string, { storeId: string; name: string; revenue: number; invoices: number; patients: number }> = {};
    allStores.forEach(st => {
      storeBreakdown[st.code] = {
        storeId: st.code,
        name: st.name.replace('Nila Clinic - ', ''),
        revenue: 0,
        invoices: 0,
        patients: 0,
      };
    });

    periodInvoices.forEach(inv => {
      const sCode = (inv.storeId || '').toUpperCase();
      const matchedKey = Object.keys(storeBreakdown).find(
        k => k.toUpperCase() === sCode || `NILA-${sCode}` === k.toUpperCase() || sCode === `NILA-${k.toUpperCase()}`
      );
      if (matchedKey && inv.status === 'Paid') {
        storeBreakdown[matchedKey].revenue += inv.grandTotal || 0;
        storeBreakdown[matchedKey].invoices += 1;
      }
    });

    completedPeriodVisits.forEach(v => {
      const sCode = (v.storeId || '').toUpperCase();
      const matchedKey = Object.keys(storeBreakdown).find(
        k => k.toUpperCase() === sCode || `NILA-${sCode}` === k.toUpperCase() || sCode === `NILA-${k.toUpperCase()}`
      );
      if (matchedKey) {
        storeBreakdown[matchedKey].patients += 1;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        storeFilter: storeCode,
        dateRange,
        startDate: startDateParam,
        endDate: endDateParam,
        kpi: {
          totalPatientsCount,
          totalBillsCount,
          totalRevenue,
          pendingPayments,
          unpaidBillsCount: unpaidInvoices.length,
          paidBillsCount: paidInvoices.length,
          averageTicket: paidInvoices.length ? Math.round(totalRevenue / paidInvoices.length) : 0,
          retentionRate,
        },
        appointmentStats,
        paymentModeTotals,
        paymentModesChart,
        categoryBreakdown,
        clientRetention,
        topServices,
        doctorCounts: Object.values(doctorCounts),
        hourlyLoad,
        peakHour,
        salesTrend,
        storeBreakdown: Object.values(storeBreakdown),
        recentInvoices: periodInvoices.slice(0, 5),
        recentVisits: periodVisits.slice(0, 5),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
