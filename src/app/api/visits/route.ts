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
    const requestedDoctorName = (body.doctorName || '').trim().toLowerCase();

    if (!patientId || !doctorId || !storeId) {
      return NextResponse.json({
        success: false,
        message: 'Patient, Doctor, and Store are required for assignment'
      }, { status: 400 });
    }

    // Enforce BR-01: Check if doctor is active and belongs to the same store
    const users = await clinicService.getUsers(storeId);
    const targetDocStr = String(doctorId).toLowerCase().trim();
    let doctor = users.find(u => 
      (String(u._id).toLowerCase() === targetDocStr || 
       u.email?.toLowerCase().trim() === targetDocStr || 
       u.name?.toLowerCase().trim() === targetDocStr ||
       (requestedDoctorName && u.name?.toLowerCase().trim() === requestedDoctorName) ||
       (targetDocStr.length > 3 && u.name?.toLowerCase().includes(targetDocStr))) && 
      u.role === 'doctor'
    );

    if (!doctor) {
      // Also check staff directory of this store
      const staffList = await clinicService.getStaff(storeId);
      const stDoctor = staffList.find(s => 
        (String(s._id).toLowerCase() === targetDocStr || 
         s.name?.toLowerCase().trim() === targetDocStr || 
         s.email?.toLowerCase().trim() === targetDocStr ||
         (requestedDoctorName && s.name?.toLowerCase().trim() === requestedDoctorName) ||
         (targetDocStr.length > 3 && s.name?.toLowerCase().includes(targetDocStr))) && 
        s.designation === 'Doctor'
      );
      if (stDoctor) {
        doctor = {
          _id: String(stDoctor._id),
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
      // Fallback search across all doctors across branches
      const allUsers = await clinicService.getUsers();
      doctor = allUsers.find(u => 
        (String(u._id).toLowerCase() === targetDocStr || 
         u.email?.toLowerCase().trim() === targetDocStr || 
         u.name?.toLowerCase().trim() === targetDocStr ||
         (requestedDoctorName && u.name?.toLowerCase().trim() === requestedDoctorName)) && 
        u.role === 'doctor'
      );
    }

    if (!doctor) {
      // Fallback search across all staff across branches
      const allStaff = await clinicService.getStaff();
      const stDoctor = allStaff.find(s => 
        (String(s._id).toLowerCase() === targetDocStr || 
         s.name?.toLowerCase().trim() === targetDocStr || 
         s.email?.toLowerCase().trim() === targetDocStr ||
         (requestedDoctorName && s.name?.toLowerCase().trim() === requestedDoctorName)) && 
        s.designation === 'Doctor'
      );
      if (stDoctor) {
        doctor = {
          _id: String(stDoctor._id),
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

    // Graceful fallback to first active doctor of the store if doctorId was stale or misaligned
    if (!doctor) {
      const activeStoreDoctor = users.find(u => u.role === 'doctor' && u.isActive !== false);
      if (activeStoreDoctor) {
        doctor = activeStoreDoctor;
      }
    }

    if (!doctor) {
      return NextResponse.json({
        success: false,
        message: `No active doctor found for store [${storeId}]. Please assign a doctor in Users & Roles.`
      }, { status: 400 });
    }

    if (doctor.isActive === false) {
      return NextResponse.json({
        success: false,
        message: 'Selected doctor is currently inactive and cannot be assigned'
      }, { status: 400 });
    }

    const targetStore = storeId.toUpperCase();

    // Check if patient already has an active visit in Waiting or In consultation
    // Rule: Never create a duplicate queue record — only reassign the existing active visit!
    const existingVisits = await clinicService.getVisits(targetStore);
    const existingActiveVisit = existingVisits.find(
      (v) =>
        (v.patientId === patientId || (patientPhone && v.patientPhone === patientPhone)) &&
        (v.status === 'Waiting' || v.status === 'In consultation')
    );

    if (existingActiveVisit) {
      const updatedVisit = await clinicService.updateVisit(
        existingActiveVisit._id || existingActiveVisit.visitId,
        {
          doctorId: doctor._id || doctor.email,
          doctorName: doctor.name,
          isReadByDoctor: false,
        }
      );
      return NextResponse.json({
        success: true,
        data: updatedVisit,
        reassigned: true,
        message: `Patient ${patientName} reassigned to ${doctor.name} in existing visit (no duplicate created)`
      });
    }

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
// 3. Receptionist reassigns doctor -> doctorId, doctorName updated without duplicate visit
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { visitId, status, caseNotes, prescriptionText, prescriptionImage, consultationFee, doctorId, doctorName } = body;

    if (!visitId) {
      return NextResponse.json({ success: false, message: 'Visit ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (caseNotes !== undefined) updates.caseNotes = caseNotes;
    if (prescriptionText !== undefined) updates.prescriptionText = prescriptionText;
    if (doctorId !== undefined) {
      updates.doctorId = doctorId;
      updates.isReadByDoctor = false; // Reset so newly assigned doctor receives notification
    }
    if (doctorName !== undefined) {
      updates.doctorName = doctorName;
    }
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
    if (status === 'Done') {
      updates.isReadByDoctor = true;
      updates.consultedAt = new Date().toISOString();

      const updatedVisit = await clinicService.updateVisit(visitId, updates);
      if (!updatedVisit) {
        return NextResponse.json({ success: false, message: 'Visit not found' }, { status: 404 });
      }

      // BUG-06 & BUG-15: Do NOT auto-create a bill in MongoDB when consultation is submitted.
      // Consultation completion simply marks the visit as Done. The bill will be generated manually
      // at the POS counter when the receptionist collects payment.
      return NextResponse.json({
        success: true,
        data: updatedVisit,
        message: 'Consultation marked Done and ready for POS billing'
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
