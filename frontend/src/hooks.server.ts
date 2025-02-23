import { redirect } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import { env } from '$env/dynamic/private';

const { AUTH_DIR } = env;

const SESSION_FILE = `${AUTH_DIR}active_sessions`;
const SESSION_EXPIRATION = 100 * 60 * 1000;

async function isValidSession(sessionId, clientIp) {
	try {
		const sessions = JSON.parse(await fs.readFile(SESSION_FILE, 'utf-8').catch(() => '{}'));
		if (!sessions[sessionId] || sessions[sessionId].ip !== clientIp) return false;
		if (Date.now() - sessions[sessionId].timestamp > SESSION_EXPIRATION) {
			delete sessions[sessionId];
			await fs.writeFile(SESSION_FILE, JSON.stringify(sessions), { mode: 0o600 });
			return false;
		}
		sessions[sessionId].timestamp = Date.now();
		await fs.writeFile(SESSION_FILE, JSON.stringify(sessions), { mode: 0o600 });
		return true;
	} catch {
		return false;
	}
}

export async function handle({ event, resolve }) {
	if (event.url.pathname === '/login') return resolve(event);
	const sessionId = event.cookies.get('session');
	const clientIp = event.getClientAddress();

	if (!sessionId || !(await isValidSession(sessionId, clientIp))) {
        console.warn('Unauthorized access attempt')
		throw redirect(303, '/login');
	}

	return resolve(event);
}
