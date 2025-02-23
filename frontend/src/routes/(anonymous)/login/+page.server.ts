import { fail, redirect } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import { env } from '$env/dynamic/private';

const { AUTH_DIR } = env;

const TOKEN_DIR = `${AUTH_DIR}login_tokens`;
const SESSION_FILE = `${AUTH_DIR}active_sessions`;
const SESSION_EXPIRATION = 100 * 60 * 1000;

async function isValidToken(token) {
	try {
		const timestamp = await fs.readFile(`${TOKEN_DIR}/${token}`, 'utf-8');
		if (Date.now() - parseInt(timestamp, 10) * 1000 > SESSION_EXPIRATION) return false;
		await fs.unlink(`${TOKEN_DIR}/${token}`);
		return true;
	} catch {
		return false;
	}
}

async function storeSession(sessionId, clientIp) {
	const sessions = JSON.parse(await fs.readFile(SESSION_FILE, 'utf-8').catch(() => '{}'));
	sessions[sessionId] = { ip: clientIp, timestamp: Date.now() };
	await fs.writeFile(SESSION_FILE, JSON.stringify(sessions), { mode: 0o600 });
}

export const actions = {
	login: async ({ request, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const token = formData.get('token');
		const clientIp = getClientAddress();

		if (!token || !(await isValidToken(token)))
			return fail(403, { error: 'Invalid or expired token' });

		const sessionId = crypto.randomUUID();
		await storeSession(sessionId, clientIp);

		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: SESSION_EXPIRATION / 1000
		});

		throw redirect(303, '/');
	},

	disconnect: async ({ cookies }) => {
		const sessionId = cookies.get('session');
		if (sessionId) {
			const sessions = JSON.parse(await fs.readFile(SESSION_FILE, 'utf-8').catch(() => '{}'));
			delete sessions[sessionId];
			await fs.writeFile(SESSION_FILE, JSON.stringify(sessions), { mode: 0o600 });
		}
		cookies.delete('session', { path: '/' });
		throw redirect(303, '/login');
	}
};
