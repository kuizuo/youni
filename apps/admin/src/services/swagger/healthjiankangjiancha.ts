// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/health/database */
export async function healthControllerCheckDatabase(options?: { [key: string]: any }) {
  return request<{
    status?: string;
    info?: Record<string, any>;
    error?: Record<string, any>;
    details?: Record<string, any>;
  }>('/api/health/database', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/health/disk */
export async function healthControllerCheckDisk(options?: { [key: string]: any }) {
  return request<{
    status?: string;
    info?: Record<string, any>;
    error?: Record<string, any>;
    details?: Record<string, any>;
  }>('/api/health/disk', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/health/memory-heap */
export async function healthControllerCheckMemoryHeap(options?: { [key: string]: any }) {
  return request<{
    status?: string;
    info?: Record<string, any>;
    error?: Record<string, any>;
    details?: Record<string, any>;
  }>('/api/health/memory-heap', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/health/memory-rss */
export async function healthControllerCheckMemoryRss(options?: { [key: string]: any }) {
  return request<{
    status?: string;
    info?: Record<string, any>;
    error?: Record<string, any>;
    details?: Record<string, any>;
  }>('/api/health/memory-rss', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/health/network */
export async function healthControllerCheckNetwork(options?: { [key: string]: any }) {
  return request<{
    status?: string;
    info?: Record<string, any>;
    error?: Record<string, any>;
    details?: Record<string, any>;
  }>('/api/health/network', {
    method: 'GET',
    ...(options || {}),
  });
}
