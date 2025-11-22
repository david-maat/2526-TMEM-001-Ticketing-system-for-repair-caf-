import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile } from '@/lib/fileUpload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand gevonden' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Alleen afbeeldingen zijn toegestaan' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Bestand is te groot (max 5MB)' },
        { status: 400 }
      );
    }

    const fileUrl = await saveUploadedFile(file);

    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Fout bij het uploaden van het bestand' },
      { status: 500 }
    );
  }
}
