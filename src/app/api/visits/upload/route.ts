import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2MB compressed limit

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let visitId = '';
    let dataUrl = '';
    let sizeBytes = 0;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      visitId = String(formData.get('visitId') || '').trim();
      const file = formData.get('file');

      if (!visitId) {
        return NextResponse.json({ success: false, message: 'Visit ID is required' }, { status: 400 });
      }
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ success: false, message: 'Image file is required' }, { status: 400 });
      }
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { success: false, message: 'Invalid image type. Only JPEG, PNG, or WebP images are accepted.' },
          { status: 400 }
        );
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { success: false, message: 'Compressed image exceeds 2MB limit. Please choose a smaller image.' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      dataUrl = `data:${file.type};base64,${base64}`;
      sizeBytes = file.size;
    } else {
      const body = await req.json();
      visitId = String(body.visitId || '').trim();
      dataUrl = String(body.prescriptionImage || '');
      if (!visitId) {
        return NextResponse.json({ success: false, message: 'Visit ID is required' }, { status: 400 });
      }
      if (dataUrl && !/^data:image\/(jpeg|png|webp);base64,/i.test(dataUrl)) {
        return NextResponse.json(
          { success: false, message: 'Invalid prescription file format. Only JPEG, PNG, or WEBP images are allowed.' },
          { status: 400 }
        );
      }
      sizeBytes = Math.round((dataUrl.length * 3) / 4);
      if (sizeBytes > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { success: false, message: 'Image size exceeds 2MB limit after compression.' },
          { status: 400 }
        );
      }
    }

    const updated = await clinicService.updateVisit(visitId, { prescriptionImage: dataUrl });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Visit not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      prescriptionImage: dataUrl,
      sizeBytes,
      message: 'Prescription image uploaded successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const visitId = searchParams.get('visitId');
    if (!visitId) {
      return NextResponse.json({ success: false, message: 'Visit ID is required' }, { status: 400 });
    }
    const updated = await clinicService.updateVisit(visitId, { prescriptionImage: '' });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Visit not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Prescription image removed' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

