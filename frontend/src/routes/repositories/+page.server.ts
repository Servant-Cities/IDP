import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { env } from '$env/dynamic/private';
import type { PageLoad } from './$types';

const { HOME_CWD } = env;

interface GitRepositoryInfo {
	name: string;
	lastCommitHash: string;
	lastCommitMessage: string;
	lastCommitDate: string;
	remoteUrl: string | null;
}

function getGitRepositoryInfo(repoPath: string): GitRepositoryInfo | null {
	try {
		const name = path.basename(repoPath);

		const lastCommitHash = execSync('git rev-parse HEAD', { cwd: repoPath }).toString().trim();

		const lastCommitMessage = execSync('git log -1 --pretty=%B', { cwd: repoPath })
			.toString()
			.trim();

		const lastCommitDate = execSync('git log -1 --pretty=%cd', { cwd: repoPath }).toString().trim();

		let remoteUrl: string | null = null;
		try {
			remoteUrl = execSync('git remote get-url origin', { cwd: repoPath }).toString().trim();
		} catch {
			remoteUrl = null;
		}

		return { name, lastCommitHash, lastCommitMessage, lastCommitDate, remoteUrl };
	} catch {
		return null;
	}
}

export const load: PageLoad = () => {
	try {
		const repoPath = path.join(HOME_CWD, 'repositories');
		console.log(repoPath);

		if (!fs.existsSync(repoPath)) {
			return { data: [] };
		}

		const repositories = fs
			.readdirSync(repoPath)
			.filter((file) => fs.statSync(path.join(repoPath, file)).isDirectory())
			.map((dir) => getGitRepositoryInfo(path.join(repoPath, dir)))
			.filter((repo): repo is GitRepositoryInfo => repo !== null); // Remove null values

		return { data: repositories };
	} catch (err) {
		throw error(500, 'Failed to read repositories');
	}
};
