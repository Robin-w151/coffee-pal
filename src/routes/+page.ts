import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { mainRoute } from '$lib/config/routes';

export const prerender = true;

export const load: PageLoad = () => {
  throw redirect(307, mainRoute.href);
};
