import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { env } from '$env/dynamic/private';
import https from 'https';
import type { PageLoad } from '../$types';

const { SITES_AVAILABLE_PATH } = env;

interface NginxSiteInfo {
    name: string;
    domain: string;
    sslCertificateLastModified?: string;
    proxyPassPort?: number;
    corsAllowed?: boolean;
    filePath: string;
    file: string;
}

function parseNginxConfig(filePath: string): NginxSiteInfo | null {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const name = path.basename(filePath);
        
        // Extract the server_name directive
        const serverNameMatch = content.match(/server_name\s+([^;]+);/);
        let domain: string;

        if (serverNameMatch) {
            domain = serverNameMatch[1].trim();
        } else {
            domain = name.replace(/\.conf$/, '');
        }

        const proxyPassMatch = content.match(/proxy_pass\s+http:\/\/[^:]+:(\d+);/);
        const sslCertMatch = content.match(/ssl_certificate\s+([^;]+);/);
        let sslCertificateLastModified = 'NOT_FOUND';

        if (sslCertMatch) {
            const certPath = sslCertMatch[1];
            if (fs.existsSync(certPath)) {
                const stats = fs.statSync(certPath);
                sslCertificateLastModified = stats.mtime.toISOString();
            }
        }

        return {
            name,
            domain,
            sslCertificateLastModified,
            proxyPassPort: proxyPassMatch ? parseInt(proxyPassMatch[1], 10) : undefined,
            filePath,
            file: content
        };
    } catch (err) {
        console.error(`Failed to parse Nginx config: ${filePath}`, err);
        return null;
    }
}

async function checkCORS(serverName: string): Promise<boolean> {
    return new Promise((resolve) => {
        const options = {
            method: 'OPTIONS',
            hostname: serverName,
            timeout: 3000
        };

        const req = https.request(options, (res) => {
            resolve(res.headers['access-control-allow-origin'] !== undefined);
        });

        req.on('error', () => resolve(false));
        req.end();
    });
}

export const load: PageLoad = async () => {
    try {
        if (!fs.existsSync(SITES_AVAILABLE_PATH)) {
            return { sites: [] };
        }

        const sites = fs
            .readdirSync(SITES_AVAILABLE_PATH)
            .filter((file) => fs.statSync(path.join(SITES_AVAILABLE_PATH, file)).isFile())
            .map((file) => parseNginxConfig(path.join(SITES_AVAILABLE_PATH, file)))
            .filter((site): site is NginxSiteInfo => site !== null);

        for (const site of sites) {
            site.corsAllowed = await checkCORS(site.domain); // Use site.domain instead of site.name
        }

        return { sites };
    } catch (err) {
        throw error(500, 'Failed to read Nginx configurations');
    }
};
