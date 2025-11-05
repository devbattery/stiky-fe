import { redirect } from 'next/navigation';
import { apiGet, apiPost, ApiError, isApiError } from './api';
import type {
  MeResponse,
  OtpVerifyResponse,
  RequestOtpPayload,
  VerifyOtpPayload,
} from './types';

export async function fetchMe(): Promise<MeResponse> {
  return apiGet<MeResponse>('/api/v1/me');
}

export async function getOptionalMe(): Promise<MeResponse | null> {
  try {
    return await fetchMe();
  } catch (error) {
    if (isApiError(error) && (error.status === 401 || error.status === 403)) {
      return null;
    }
    if (isApiError(error) && error.status === 428) {
      return null;
    }
    throw error;
  }
}

export async function requireAuthenticated(options: { requireOnboarded?: boolean } = {}): Promise<MeResponse> {
  try {
    const me = await fetchMe();
    if (options.requireOnboarded && !me.blog) {
      redirect('/onboarding');
    }
    return me;
  } catch (error) {
    if (isApiError(error)) {
      if (error.status === 428) {
        redirect('/onboarding');
      }
      if (error.status === 401) {
        redirect('/login');
      }
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiPost('/api/v1/auth/logout');
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      return;
    }
    throw error;
  }
}

export async function requestOtp(payload: RequestOtpPayload): Promise<void> {
  await apiPost('/api/v1/auth/request-otp', payload, { cache: 'no-store' });
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<OtpVerifyResponse> {
  return apiPost<OtpVerifyResponse>('/api/v1/auth/verify-otp', payload, { cache: 'no-store' });
}
