import pm2 from 'pm2';
import fs from 'fs';
import path from 'path';
import { error, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { exec } from 'child_process';
import util from 'util';
import type { PageLoad } from './$types';

const execPromise = util.promisify(exec);
const SERVICES_PATH = path.resolve(env.SERVICES_PATH);

function getPort(service: pm2.ProcessDescription): number | null {
	if (service.pm2_env?.PORT) return service.pm2_env?.PORT;
	if (service.pm2_env?.env?.PORT) return service.pm2_env?.env?.PORT;
	return null;
}

function findAvailablePort(usedPorts: number[]): number {
	let port = 3000;
	while (usedPorts.includes(port)) {
		port++;
	}
	return port;
}

async function buildApp(appPath: string) {
	try {
		const packageJsonPath = path.join(appPath, 'package.json');
		if (fs.existsSync(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
			if (packageJson.scripts && packageJson.scripts.build) {
				await execPromise(`yarn --cwd ${appPath} install`);
				const { stdout, stderr } = await execPromise(`yarn --cwd ${appPath} build`);
				if (stderr) console.error('Build errors:', stderr);
			}
		}
	} catch (err) {
		console.error('Build failed with error:', err);
		if (err.code) console.error(`Build process exited with code: ${err.code}`);
		throw error(500, `Build failed: ${err.message}`);
	}
}

function pm2Connect(): Promise<void> {
	return new Promise((resolve, reject) => {
		pm2.connect((err) => {
			if (err) reject(error(500, 'Failed to connect to PM2'));
			else resolve();
		});
	});
}

function pm2List(): Promise<pm2.ProcessDescription[]> {
	return new Promise((resolve, reject) => {
		pm2.list((err, list) => {
			if (err) reject(error(500, 'Failed to list PM2 services'));
			else resolve(list);
		});
	});
}

function pm2Start(appConfig: any): Promise<void> {
	return new Promise((resolve, reject) => {
		pm2.start(appConfig, (err) => {
			if (err) reject(error(500, `Failed to start service: ${err.message}`));
			else resolve();
		});
	});
}

export const load: PageLoad = async () => {
	await pm2Connect();

	try {
		const list = await pm2List();
		pm2.disconnect();
		const transformedList = list.map((service) => ({
			pid: service.pid,
			name: service.name,
			status: service.pm2_env?.status,
			pm_cwd: service.pm2_env?.pm_cwd,
			pm_uptime: service.pm2_env?.pm_uptime,
			port: getPort(service),
			unstable_restarts: service.pm2_env?.unstable_restarts,
			memory: service.monit?.memory,
			cpu: service.monit?.cpu
		}));
		return { list: transformedList };
	} catch (err) {
		pm2.disconnect();
		throw error(500, `Failed to load PM2 services: ${err.message}`);
	}
};

export const actions = {
	start: async ({ request }) => {
		const formData = await request.formData();
		const appPath = formData.get('appPath');
		const name = formData.get('name');
		const script = formData.get('script');
		const envString = formData.get('env');

		if (!appPath || !name || !script) {
			return fail(400, { error: 'Missing required fields' });
		}

		try {
			await buildApp(appPath);
		} catch (err) {
			console.error(`Build failed for ${name}: ${err}`);
			return fail(500, { error: `Build failed: ${err.message}` });
		}

		const envVars = Object.fromEntries(envString.split('\n').map((line) => line.split('=')));
		const ecosystemFile = path.join(SERVICES_PATH, 'ecosystem.config.js');
		console.log('Current working directory:', process.cwd());

		await pm2Connect();

		try {
			const usedPorts = (await pm2List()).map(getPort).filter((p): p is number => p !== null);
			const port = findAvailablePort(usedPorts);

			let ecosystemConfig = { apps: [] };
			if (fs.existsSync(ecosystemFile)) {
				console.log(`Ecosystem file found at: ${ecosystemFile}`);
				try {
					ecosystemConfig = (await import(/* @vite-ignore */ ecosystemFile)).default;
					console.log({ecosystemConfig})
				} catch (err) {
					console.error(`Error loading ecosystem file: ${ecosystemFile} - ${err.message}`);
				}
			} else {
				console.error(`Ecosystem file not found at: ${ecosystemFile}`);
			}

			const newApp = {
				name,
				script,
				cwd: appPath,
				env: { NODE_ENV: 'production', PORT: port, ...envVars },
				watch: false,
				instances: 1,
				autorestart: true,
				max_memory_restart: '500M'
			};

			ecosystemConfig.apps = ecosystemConfig.apps.filter((app) => app.name !== name);
			ecosystemConfig.apps.push(newApp);

			await pm2Start(newApp);
			pm2.disconnect();

			fs.writeFileSync(
				ecosystemFile,
				`module.exports = ${JSON.stringify(ecosystemConfig, null, 2)};`
			);
		} catch (err) {
			pm2.disconnect();
			console.error(`Failed to start repository ${name}: ${err.message ? err.message : err}`);
			return fail(500, { error: `Failed to start repository: ${err.message ? err.message : err}` });
		}
	}
};
