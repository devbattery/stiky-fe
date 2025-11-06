'use client';

import type { CloudinaryUploadResponse, UploadSignature } from './types';

export async function fetchUploadSignature(): Promise<UploadSignature> {
  const res = await fetch('/api/proxy/uploads-signature', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to retrieve upload signature');
  }
  return (await res.json()) as UploadSignature;
}

export async function uploadImage(file: File): Promise<CloudinaryUploadResponse> {
  const signature = await fetchUploadSignature();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.api_key);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);

  const cloudName = signature.cloud_name;
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  return (await response.json()) as CloudinaryUploadResponse;
}
