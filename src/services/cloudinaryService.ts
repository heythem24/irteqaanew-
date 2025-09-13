// These can be overridden via .env (Vite). We provide safe defaults to run out of the box.
// Do NOT put API secrets in frontend. We rely on an UNSIGNED upload preset.
const CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || 'dyfpcbtjf';
const UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || 'irteqaaNew';

if (!CLOUD_NAME) {
  // eslint-disable-next-line no-console
  console.warn('Cloudinary: VITE_CLOUDINARY_CLOUD_NAME is not set. Image uploads will fail.');
}

export interface CloudinaryUploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  original_filename?: string;
}

/**
 * Upload an image file to Cloudinary using an UNSIGNED upload preset.
 * Never expose API secrets in the frontend. Configure the preset as unsigned in Cloudinary console.
 */
export async function uploadToCloudinary(file: File, options?: { folder?: string; uploadPreset?: string; tags?: string[]; onProgress?: (p: number) => void; }): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME) throw new Error('Cloudinary cloud name is not configured');

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', options?.uploadPreset || UPLOAD_PRESET);
  if (options?.folder) form.append('folder', options.folder);
  if (options?.tags?.length) form.append('tags', options.tags.join(','));

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  // Use fetch; progress not natively supported. If we want progress, we could use XHR.
  const res = await fetch(endpoint, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  return (await res.json()) as CloudinaryUploadResult;
}
