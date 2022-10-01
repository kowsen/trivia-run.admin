import { GameClient } from './socket/lib/client.js';
import { adminReducer, type AdminQuestionOrder } from './socket/trivia/admin_state.js';
import { getAdminToken, upgradeToAdmin } from './socket/trivia/admin_rpcs.js';
import type { RequestDoc, StatusResponse } from './socket/trivia/base';
import { navigate } from 'svelte-routing';
import { derived } from 'svelte/store';

export const client = new GameClient(import.meta.env.VITE_BACKEND, adminReducer, upgrade);

export async function refreshToken(password: string): Promise<StatusResponse> {
  const response = await client.call(getAdminToken, { password });
  localStorage.setItem('token', response.token);
  return upgrade();
}

export async function upgrade(): Promise<StatusResponse> {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return { success: false };
  }

  const response = await client.call(upgradeToAdmin, { token });
  if (response.success) {
    if (window.location.pathname === '/login') {
      navigate('/');
    }
  } else {
    navigate('/login');
  }
  return response;
}

export const order = derived(client, ({ order }): RequestDoc<AdminQuestionOrder> => {
  const docs = order.ids.map(id => order.entities[id]);
  return docs.sort((a, b) => b._modified - a._modified)[0] ?? { main: [], bonus: [] };
});
