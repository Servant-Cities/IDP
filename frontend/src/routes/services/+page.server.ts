import pm2 from 'pm2';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

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

	// Transform the list to include only the necessary fields
	const transformedList = (await list).map((service) => ({
		service,
		pid: service.pid,
		name: service.name,
		pm2_env: {
			status: service.pm2_env?.status,
			pm_cwd: service.pm2_env?.pm_cwd,
			pm_uptime: service.pm2_env?.pm_uptime,
			args: service.pm2_env?.args,
			unstable_restarts: service.pm2_env?.unstable_restarts,
		},
		monit: {
			memory: service.monit?.memory,
			cpu: service.monit?.cpu,
		},
	}));

	return { list: transformedList };
};
