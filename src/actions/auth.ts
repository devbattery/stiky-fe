'use server';

import { logout, requestOtp, verifyOtp } from '@/lib/auth';
import type { OtpVerifyResponse, RequestOtpPayload, VerifyOtpPayload } from '@/lib/types';

export async function requestOtpAction(payload: RequestOtpPayload): Promise<void> {
  await requestOtp(payload);
}

export async function verifyOtpAction(payload: VerifyOtpPayload): Promise<OtpVerifyResponse> {
  return verifyOtp(payload);
}

export async function logoutAction(): Promise<void> {
  await logout();
}
