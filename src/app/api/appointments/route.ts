import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const date = searchParams.get('date') || undefined;
    const staffId = searchParams.get('staffId') || undefined;

    const appointments = await clinicService.getAppointments(storeCode, date, staffId);
    return NextResponse.json({ success: true, data: appointments });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// FR-58 & FR-61: Book appointment with double-booking check & inline client support
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerId,
      customerName,
      customerPhone,
      serviceName,
      serviceId,
      staffName,
      staffId,
      doctorId,
      doctorName,
      storeId,
      date,
      startTime,
      time,
      durationMins,
      amount,
      notes,
      force, // flag to override double-booking warning
    } = body;

    const targetStore = (storeId || 'NILA-TH').toUpperCase();
    const apptTime = startTime || time || '10:00 AM';
    const duration = Number(durationMins) || 15;
    const targetStaff = staffId || doctorId || staffName || doctorName || 'Staff';

    // Double-booking check (FR-61)
    if (!force) {
      const conflictCheck = await clinicService.checkDoubleBooking(
        date || new Date().toISOString().split('T')[0],
        apptTime,
        duration,
        targetStaff
      );

      if (conflictCheck.hasConflict) {
        return NextResponse.json({
          success: false,
          warning: 'Double Booking Conflict',
          conflict: conflictCheck.conflictingAppt,
          message: `Specialist ${targetStaff} already has an overlapping appointment at ${conflictCheck.conflictingAppt?.startTime || conflictCheck.conflictingAppt?.time}. Do you want to proceed anyway?`,
        }, { status: 409 });
      }
    }

    // Ensure customer exists in shared master
    let client = customerId ? (await clinicService.getCustomers()).find(c => c._id === customerId || c.customerId === customerId) : null;
    if (!client && customerPhone) {
      const matches = await clinicService.searchCustomerByMobile(customerPhone);
      if (matches.length > 0) {
        client = matches[0];
      } else {
        client = await clinicService.createCustomer({
          name: customerName,
          mobile: customerPhone,
          firstStoreId: targetStore,
          notes: `Created via appointment for ${serviceName}`,
        });
      }
    }

    const apptDate = date || new Date().toISOString().split('T')[0];

    // BUG-02: Server-side duplicate appointment prevention (same patient, service, date, and time slot)
    const existingAppointments = await clinicService.getAppointments();
    const isDuplicate = existingAppointments.find(a =>
      a.status !== 'Cancelled' &&
      a.date === apptDate &&
      (a.startTime === apptTime || a.time === apptTime) &&
      a.serviceName?.toLowerCase().trim() === serviceName?.toLowerCase().trim() &&
      ((customerPhone && a.customerPhone === customerPhone) ||
       (client && (a.customerId === client._id || a.customerId === client.customerId)) ||
       (customerId && a.customerId === customerId))
    );

    if (isDuplicate) {
      return NextResponse.json({
        success: true,
        data: isDuplicate,
        duplicatePrevented: true,
        message: 'Appointment is already booked for this time slot.',
      });
    }

    const newAppt = await clinicService.createAppointment({
      customerId: client?.customerId || client?._id || customerId,
      customerName: customerName || client?.name || 'Client',
      customerPhone: customerPhone || client?.mobile || '',
      serviceName,
      serviceId,
      staffName: staffName || doctorName || 'Attending Specialist',
      staffId,
      doctorId,
      doctorName,
      storeId: targetStore,
      date: date || new Date().toISOString().split('T')[0],
      startTime: apptTime,
      durationMins: duration,
      status: 'Booked',
      amount: Number(amount) || 0,
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      data: newAppt,
      message: 'Appointment booked successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// FR-62 & FR-63: Update appointment status (Arrived, Cancelled, Completed, etc.)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, _id, action, status, cancelReason, ...otherUpdates } = body;
    const targetId = id || _id;

    if (!targetId) {
      return NextResponse.json({ success: false, message: 'Appointment ID is required' }, { status: 400 });
    }

    // Check-in action (marks Arrived and pushes patient to Doctor queue)
    if (action === 'check-in' || status === 'Arrived') {
      const result = await clinicService.checkInAppointment(targetId);
      return NextResponse.json({
        success: true,
        data: result.appointment,
        visit: result.visit,
        message: 'Client checked in successfully. Doctor queue updated.',
      });
    }

    const updates: any = { ...otherUpdates };
    if (status) updates.status = status;
    if (cancelReason) updates.cancelReason = cancelReason;

    const updated = await clinicService.updateAppointment(targetId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Appointment status updated to ${updated.status}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      await clinicService.clearAllAppointments();
      return NextResponse.json({ success: true, message: 'All appointments cleared successfully' });
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Appointment ID is required' }, { status: 400 });
    }

    const deleted = await clinicService.deleteAppointment(id);
    return NextResponse.json({ success: true, data: deleted, message: 'Appointment deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
