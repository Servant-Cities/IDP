import pm2 from 'pm2';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

function getPort(service: pm2.ProcessDescription): number | null {
	if (service.pm2_env?.PORT) return service.pm2_env?.PORT;

	const portArgIndex = service.pm2_env?.args.indexOf('--port');
	if (portArgIndex !== -1 && service.pm2_env?.args[portArgIndex + 1]) {
		return parseInt(service.pm2_env?.args[portArgIndex + 1], 10);
	}

	if (service.pm2_env?.env?.PORT) return service.pm2_env?.env?.PORT;

	return null;
}

export const load: PageLoad = async () => {
	const list: Promise<Array<pm2.ProcessDescription>> = new Promise((resolve, reject) => {
		pm2.connect((err) => {
			if (err) {
				reject(error(404, 'Cannot connect to pm2 api'));
			}

			pm2.list((err, list) => {
				if (err) {
					reject(error(500, 'Cannot list pm2 services'));
				}

				pm2.disconnect();
				resolve(list);
			});
		});
	});

	const transformedList = (await list).map((service) => ({
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
};
