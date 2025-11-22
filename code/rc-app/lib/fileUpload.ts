import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

/**
 * Ensures the upload directory exists
 */
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Generates a unique filename with timestamp and random string
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Saves an uploaded file to the uploads directory
 * @param file - The File object from the upload
 * @returns The relative URL path to the saved file (e.g., /uploads/filename.jpg)
 */
export async function saveUploadedFile(file: File): Promise<string> {
  await ensureUploadDir();
  
  const filename = generateUniqueFilename(file.name);
  const filepath = join(UPLOAD_DIR, filename);
  
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  
  // Return the public URL path
  return `/uploads/${filename}`;
}

/**
 * Deletes a file from the uploads directory
 * @param fileUrl - The URL path of the file (e.g., /uploads/filename.jpg)
 */
export async function deleteUploadedFile(fileUrl: string): Promise<void> {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
    return;
  }
  
  const filename = fileUrl.split('/').pop();
  if (!filename) return;
  
  const filepath = join(UPLOAD_DIR, filename);
  
  try {
    const { unlink } = await import('fs/promises');
    if (existsSync(filepath)) {
      await unlink(filepath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw - just log the error
  }
}
