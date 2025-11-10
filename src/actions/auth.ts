'use server';

import { logout, requestOtp, verifyOtp } from '@/lib/auth';
import type { OtpVerifyResponse, RequestOtpPayload, VerifyOtpPayload } from '@/lib/types';

export async function logoutAction(): Promise<void> {
  await logout();
}
