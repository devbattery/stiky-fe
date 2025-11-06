import { NextResponse } from 'next/server';
import { apiPost, ApiError } from '@/lib/api';
import type { UploadSignature } from '@/lib/types';

export async function POST() {
  try {
    const signature = await apiPost<UploadSignature>('/api/v1/uploads/signature');
    return NextResponse.json(signature);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          message: error.message,
          status: error.status,
          data: error.data,
        },
        { status: error.status },
      );
    }
    return NextResponse.json({ message: 'Failed to generate upload signature' }, { status: 500 });
  }
}
