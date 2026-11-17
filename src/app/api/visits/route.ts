import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const doctorId = searchParams.get('doctorId') || undefined;
    const status = searchParams.get('status') || undefined;
    const unreadOnly = searchParams.get('unread') === 'true';

    let visits = await clinicService.getVisits(storeCode, doctorId, status);

    if (unreadOnly) {
      visits = visits.filter(v => !v.isReadByDoctor);
    }

    const unreadCount = visits.filter(v => !v.isReadByDoctor && v.status === 'Waiting').length;

    return NextResponse.json({
      success: true,
      data: visits,
      unreadCount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// FR-12 & BR-01: Assign Doctor to Patient (Must be active doctor of the same store)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const patientId = body.patientId || body.customerId || body._id;
    const patientName = body.patientName || body.name || 'Patient';
    const patientPhone = body.patientPhone || body.phone || body.mobile || '';
    const storeId = (body.storeId || 'NILA-TH').toUpperCase();
    const doctorId = body.doctorId || body.doctor;

    if (!patientId || !doctorId || !storeId) {
      return NextResponse.json({
        success: false,
        message: 'Patient, Doctor, and Store are required for assignment'
      }, { status: 400 });
    }

    // Enforce BR-01: Check if doctor is active and belongs to the same store
    const users = await clinicService.getUsers(storeId);
    let doctor = users.find(u => (u._id === doctorId || u.email === doctorId || u.name === doctorId) && u.role === 'doctor');

    if (!doctor) {
      // Also check staff directory
      const staffList = await clinicService.getStaff(storeId);
      const stDoctor = staffList.find(s => (s._id === doctorId || s.name === doctorId || s.email === doctorId) && s.designation === 'Doctor');
      if (stDoctor) {
        doctor = {
          _id: stDoctor._id,
          name: stDoctor.name,
          email: stDoctor.email || 'doctor@nilaclinic.com',
          role: 'doctor',
          phone: stDoctor.mobile,
          assignedStoreIds: stDoctor.stores || [storeId],
          primaryStoreId: stDoctor.stores?.[0] || storeId,
          isActive: stDoctor.isActive !== false,
        };
      }
    }

    if (!doctor) {
      // Fallback search across all doctors
      const allUsers = await clinicService.getUsers();
      doctor = allUsers.find(u => (u._id === doctorId || u.email === doctorId) && u.role === 'doctor');
    }

    if (!doctor) {
      return NextResponse.json({
        success: false,
        message: 'Doctor not found or does not belong to this clinic store'
      }, { status: 400 });
    }

    if (doctor.isActive === false) {
      return NextResponse.json({
        success: false,
        message: 'Selected doctor is currently inactive and cannot be assigned'
      }, { status: 400 });
    }

    const targetStore = storeId.toUpperCase();

    // Create visit in 'Waiting' status
    const visit = await clinicService.createVisit({
      patientId,
      patientName: patientName || 'Patient',
      patientPhone: patientPhone || '',
      storeId: targetStore,
      doctorId: doctor._id || doctor.email,
      doctorName: doctor.name,
      status: 'Waiting',
    });

    return NextResponse.json({
      success: true,
      data: visit,
      message: `Patient ${patientName} assigned to ${doctor.name} and placed in Waiting queue`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// Doctor workflow updates:
// 1. Doctor opens patient -> status: 'In consultation', isReadByDoctor: true (FR-14, FR-15)
// 2. Doctor writes notes, prescription, prescriptionImage, clicks submit -> status: 'Done', auto-creates bill (FR-16, FR-17, FR-18, FR-19, BR-02, NFR-06)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { visitId, status, caseNotes, prescriptionText, prescriptionImage, consultationFee } = body;

    if (!visitId) {
      return NextResponse.json({ success: false, message: 'Visit ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (caseNotes !== undefined) updates.caseNotes = caseNotes;
    if (prescriptionText !== undefined) updates.prescriptionText = prescriptionText;
    if (prescriptionImage !== undefined) {
      // NFR-03: Validate image format and size if provided
      if (prescriptionImage && prescriptionImage.startsWith('data:')) {
        const isImage = prescriptionImage.startsWith('data:image/jpeg') ||
                        prescriptionImage.startsWith('data:image/png') ||
                        prescriptionImage.startsWith('data:image/webp');
        if (!isImage) {
          return NextResponse.json({
            success: false,
            message: 'Invalid prescription file format. Only JPEG, PNG, or WEBP images are allowed.'
          }, { status: 400 });
        }
      }
      updates.prescriptionImage = prescriptionImage;
    }

    // If doctor opened the patient
    if (status === 'In consultation') {
      updates.isReadByDoctor = true;
    }

    // If consultation is completed
    let generatedBill = null;
    if (status === 'Done') {
      updates.isReadByDoctor = true;
      updates.consultedAt = new Date().toISOString();

      const updatedVisit = await clinicService.updateVisit(visitId, updates);
      if (!updatedVisit) {
        return NextResponse.json({ success: false, message: 'Visit not found' }, { status: 404 });
      }

      // Auto-create bill (BR-02, NFR-06)
      generatedBill = await clinicService.autoCreateBillForVisit(visitId, Number(consultationFee) || 500);

      return NextResponse.json({
        success: true,
        data: updatedVisit,
        bill: generatedBill,
        message: 'Consultation marked Done and bill auto-generated for billing counter'
      });
    }

    const updated = await clinicService.updateVisit(visitId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Visit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
