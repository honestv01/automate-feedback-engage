// Supabase-backed store for the review automation platform.
// Loads data from Postgres tables and mutates via edge functions + direct queries.

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type RequestStatus = 'pending' | 'clicked' | 'reviewed' | 'feedback' | 'failed' | 'opted_out';

export type ReviewRequest = {
  id: string;
  customerName: string;
  phone: string;
  employeeId: string;
  employeeName: string;
  createdAt: number;
  status: RequestStatus;
  rating?: number;
  feedback?: string;
  twilioSid?: string;
  twilioStatus?: string;
  reminderSentAt?: number;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'employee';
  active: boolean;
  joinedAt: number;
};

export type PrivateFeedback = {
  id: string;
  requestId: string;
  customerName: string;
  rating: number;
  feedback: string;
  employeeName: string;
  createdAt: number;
  read: boolean;
};

type Business = {
  id: string;
  name: string;
  googleReviewUrl: string;
  plan: 'solo' | 'team' | 'growth';
};

type State = {
  business: Business;
  currentUser: Employee | null;
  employees: Employee[];
  requests: ReviewRequest[];
  feedback: PrivateFeedback[];
  loading: boolean;
};

const DEFAULT_BUSINESS_ID = 'b1111111-1111-1111-1111-111111111111';

const initialState: State = {
  business: { id: DEFAULT_BUSINESS_ID, name: 'Acme Home Services', googleReviewUrl: '', plan: 'team' },
  currentUser: null,
  employees: [],
  requests: [],
  feedback: [],
  loading: true,
};

let state: State = initialState;
const readLocal = new Map<string, boolean>(); // local-only "read" state for private feedback

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() { listeners.forEach((l) => l()); }
export const store = {
  get: () => state,
  set: (updater: (s: State) => State) => { state = updater(state); emit(); },
  subscribe: (l: Listener) => { listeners.add(l); return () => listeners.delete(l); },
};

function mapRequest(row: any): ReviewRequest {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    employeeId: row.employee_id,
    employeeName: row._employee_name || '',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    status: row.status,
    rating: row.rating ?? undefined,
    feedback: row.feedback ?? undefined,
    twilioSid: row.twilio_sid ?? undefined,
    twilioStatus: row.twilio_status ?? undefined,
    reminderSentAt: row.reminder_sent_at ? new Date(row.reminder_sent_at).getTime() : undefined,
  };
}

function mapEmployee(row: any): Employee {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    active: row.active,
    joinedAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

export async function loadAll() {
  store.set((s) => ({ ...s, loading: true }));

  const businessId = state.business.id || DEFAULT_BUSINESS_ID;

  const [{ data: biz }, { data: emps }, { data: reqs }] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', businessId).maybeSingle(),
    supabase.from('employees').select('*').eq('business_id', businessId).order('created_at', { ascending: true }),
    supabase.from('review_requests').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(200),
  ]);

  const employees = (emps || []).map(mapEmployee);
  const empMap = new Map(employees.map((e) => [e.id, e.name]));
  const requests = (reqs || []).map((r) => mapRequest({ ...r, _employee_name: empMap.get(r.employee_id) || '' }));

  const feedback: PrivateFeedback[] = requests
    .filter((r) => r.status === 'feedback' && r.rating && r.rating <= 3 && r.feedback)
    .map((r) => ({
      id: r.id,
      requestId: r.id,
      customerName: r.customerName,
      rating: r.rating!,
      feedback: r.feedback!,
      employeeName: r.employeeName,
      createdAt: r.createdAt,
      read: readLocal.get(r.id) || false,
    }));

  // Pick a default current user (first employee, prefer non-owner)
  let currentUser = state.currentUser;
  if (!currentUser || !employees.find((e) => e.id === currentUser!.id)) {
    currentUser = employees.find((e) => e.role === 'employee' && e.active) || employees[0] || null;
  }

  store.set((s) => ({
    ...s,
    business: biz ? {
      id: biz.id,
      name: biz.name,
      googleReviewUrl: biz.google_review_url || '',
      plan: biz.plan,
    } : s.business,
    employees,
    requests,
    feedback,
    currentUser,
    loading: false,
  }));
}

// Hook with auto-load
export function useStore() {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = store.subscribe(() => force((n) => n + 1));
    if (state.loading && state.employees.length === 0) {
      loadAll().catch(console.error);
    }
    return () => { unsub(); };
  }, []);
  return state;
}

export async function sendReviewRequest(customerName: string, phone: string): Promise<{ ok: boolean; preview?: string; error?: string }> {
  const user = state.currentUser;
  if (!user) return { ok: false, error: 'No active user' };

  try {
    const { data, error } = await supabase.functions.invoke('send-review-sms', {
      body: {
        business_id: state.business.id,
        employee_id: user.id,
        customer_name: customerName,
        phone,
      },
    });

    if (error) return { ok: false, error: error.message };
    await loadAll();
    if (data?.sent === false && data?.error) {
      return { ok: false, error: data.error, preview: data.sms_preview };
    }
    return { ok: true, preview: data?.sms_preview };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export async function submitReview(requestId: string, rating: number, feedbackText?: string) {
  const update: any = { rating };
  if (rating >= 4) {
    update.status = 'reviewed';
    update.completed_at = new Date().toISOString();
  } else {
    update.status = 'feedback';
    update.feedback = feedbackText || '';
    update.completed_at = new Date().toISOString();
  }
  await supabase.from('review_requests').update(update).eq('id', requestId);
  await loadAll();
}

export async function markRequestClicked(requestId: string) {
  const req = state.requests.find((r) => r.id === requestId);
  if (!req || req.status !== 'pending') return;
  await supabase
    .from('review_requests')
    .update({ status: 'clicked', clicked_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('status', 'pending');
  await loadAll();
}

export function markFeedbackRead(id: string) {
  readLocal.set(id, true);
  store.set((s) => ({
    ...s,
    feedback: s.feedback.map((f) => (f.id === id ? { ...f, read: true } : f)),
  }));
}

export async function addEmployee(name: string, email: string) {
  await supabase.from('employees').insert({
    business_id: state.business.id,
    name,
    email,
    role: 'employee',
    active: true,
  });
  await loadAll();
}

export async function toggleEmployee(id: string) {
  const e = state.employees.find((x) => x.id === id);
  if (!e) return;
  await supabase.from('employees').update({ active: !e.active }).eq('id', id);
  await loadAll();
}

export function setCurrentUser(user: Employee) {
  store.set((s) => ({ ...s, currentUser: user }));
}

export async function setPlan(plan: 'solo' | 'team' | 'growth') {
  await supabase.from('businesses').update({ plan }).eq('id', state.business.id);
  await loadAll();
}

export function planLimit(plan: 'solo' | 'team' | 'growth') {
  return plan === 'solo' ? 1 : plan === 'team' ? 5 : 15;
}
