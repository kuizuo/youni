// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 POST /api/auth/email/send */
export async function emailControllerSendEmailCode(
  body: API.SendEmailCodeDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/auth/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/auth/google */
export async function googleControllerGoogleAuth(options?: { [key: string]: any }) {
  return request<any>('/api/auth/google', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/auth/google/callback */
export async function googleControllerGoogleAuthRedirect(options?: { [key: string]: any }) {
  return request<any>('/api/auth/google/callback', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/login */
export async function authControllerLogin(body: API.LoginDto, options?: { [key: string]: any }) {
  return request<any>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/register */
export async function authControllerRegister(
  body: API.RegisterDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
