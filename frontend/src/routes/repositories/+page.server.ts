import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { env } from '$env/dynamic/private';
import type { PageLoad } from './$types';

const { REPOSITORIES_PATH } = env;

interface GitRepositoryInfo {
	name: string;
	lastCommitHash: string;
	lastCommitMessage: string;
	lastCommitDate: string;
	remoteUrl: string | null;
	activeBranch: string;
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

		// Fetch the active branch name
		const activeBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath }).toString().trim();

		return { name, lastCommitHash, lastCommitMessage, lastCommitDate, remoteUrl, activeBranch };
	} catch {
		return null;
	}
}

export const load: PageLoad = () => {
	try {
		if (!fs.existsSync(REPOSITORIES_PATH)) {
			throw error(404, `Failed they are no repositories in ${REPOSITORIES_PATH}`)
		}

		const repositories: Array<GitRepositoryInfo> = fs
			.readdirSync(REPOSITORIES_PATH)
			.filter((file) => fs.statSync(path.join(REPOSITORIES_PATH, file)).isDirectory())
			.map((dir) => getGitRepositoryInfo(path.join(REPOSITORIES_PATH, dir)))
			.filter((repo): repo is GitRepositoryInfo => repo !== null);

		return { repositories };
	} catch (err) {
		throw error(500, 'Failed to read repositories');
	}
};
