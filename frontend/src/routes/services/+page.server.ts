import pm2 from 'pm2';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return new Promise((resolve, reject) => {
		pm2.connect((err) => {
			if (err) {
				reject(error(404, 'Cannot connect to pm2 api'));
			}

			pm2.list((err, list) => {
				if (err) {
					reject(error(500, 'Cannot list pm2 services'));
				}


				pm2.disconnect();
				resolve({data: list});
			});
		});
	});
};
