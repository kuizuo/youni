// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/auth/captcha/image */
export async function captchaControllerCaptchaByImg(options?: { [key: string]: any }) {
  return request<any>('/api/auth/captcha/image', {
    method: 'GET',
    ...(options || {}),
  });
}
