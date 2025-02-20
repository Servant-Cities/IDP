import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import type { PageLoad } from './$types';

const NGINX_SITES_PATH = "/etc/nginx/sites-available/";

interface NginxSiteInfo {
    name: string;
    path: string;
    serverNames: string[];
    listenPorts: number[];
    proxyPass?: string;
    sslCertificate?: string;
    sslCertificateKey?: string;
}

function parseNginxConfig(filePath: string): NginxSiteInfo | null {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        const name = path.basename(filePath);
        const serverNames = Array.from(content.matchAll(/server_name\s+([^;]+);/g), m => m[1].trim());
        const listenPorts = Array.from(content.matchAll(/listen\s+(\d+);/g), m => parseInt(m[1], 10));
        const proxyPassMatch = content.match(/proxy_pass\s+([^;]+);/);
        const sslCertMatch = content.match(/ssl_certificate\s+([^;]+);/);
        const sslKeyMatch = content.match(/ssl_certificate_key\s+([^;]+);/);

        return {
            name,
            path: filePath,
            serverNames,
            listenPorts,
            proxyPass: proxyPassMatch ? proxyPassMatch[1] : undefined,
            sslCertificate: sslCertMatch ? sslCertMatch[1] : undefined,
            sslCertificateKey: sslKeyMatch ? sslKeyMatch[1] : undefined
        };
    } catch (err) {
        console.error(`Failed to parse Nginx config: ${filePath}`, err);
        return null;
    }
}

export const load: PageLoad = () => {
    try {
        if (!fs.existsSync(NGINX_SITES_PATH)) {
            return { data: [] };
        }

        const sites = fs.readdirSync(NGINX_SITES_PATH)
            .filter(file => fs.statSync(path.join(NGINX_SITES_PATH, file)).isFile())
            .map(file => parseNginxConfig(path.join(NGINX_SITES_PATH, file)))
            .filter((site): site is NginxSiteInfo => site !== null);

        return { data: sites };
    } catch (err) {
        throw error(500, 'Failed to read Nginx configurations');
    }
};
