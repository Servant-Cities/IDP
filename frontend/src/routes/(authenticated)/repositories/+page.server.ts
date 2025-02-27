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
	path: string;
}

function getGitRepositoryInfo(repoPath: string): GitRepositoryInfo | null {
	try {

		if (!fs.existsSync(repoPath)) {
			console.error(`Repository path does not exist: ${repoPath}`);
			return null;
		}

		if (!fs.existsSync(path.join(repoPath, '.git'))) {
			console.error(`No .git directory found in ${repoPath}. Skipping...`);
			return null;
		}

		const name = path.basename(repoPath);
		let lastCommitHash = 'N/A';
		let lastCommitMessage = '';
		let lastCommitDate = 'N/A';
		let activeBranch = 'N/A';
		let remoteUrl: string | null = null;

		try {
			lastCommitHash = execSync('git rev-parse HEAD', { cwd: repoPath }).toString().trim();
			lastCommitMessage = execSync('git log -1 --pretty=%B', { cwd: repoPath }).toString().trim();
			lastCommitDate = execSync('git log -1 --pretty=%cd', { cwd: repoPath }).toString().trim();
			activeBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath }).toString().trim();
		} catch {
			console.warn(`No commits found in ${repoPath}. Setting default values.`);
		}

		try {
			remoteUrl = execSync('git remote get-url origin', { cwd: repoPath }).toString().trim();
		} catch {
			console.warn(`No remote URL found for ${repoPath}`);
			remoteUrl = null;
		}

		return {
			name,
			lastCommitHash,
			lastCommitMessage,
			lastCommitDate,
			remoteUrl,
			activeBranch,
			path: repoPath
		};
	} catch (error) {
		console.error(`Failed to get Git repository info for ${repoPath}: ${error.message}`);
		return null;
	}
}


export const load: PageLoad = () => {
	try {
		if (!fs.existsSync(REPOSITORIES_PATH)) {
			throw error(404, `Failed they are no repositories in ${REPOSITORIES_PATH}`);
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

export const actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		const url = formData.get('clone-url');
		let name = formData.get('name');

		if (!url) {
			throw error(400, 'Repository URL is required');
		}

		if (!fs.existsSync(REPOSITORIES_PATH)) {
			fs.mkdirSync(REPOSITORIES_PATH, { recursive: true });
		}

		const existingRepositories = fs.readdirSync(REPOSITORIES_PATH);

		for (const repo of existingRepositories) {
			const repoPath = path.join(REPOSITORIES_PATH, repo);
			const repoInfo = getGitRepositoryInfo(repoPath);
			if (repoInfo && repoInfo.remoteUrl === url) {
				throw error(400, 'This repository has already been cloned');
			}
		}

		if (!name) {
			name = path.basename(url, '.git');
		}

		let uniqueName = name;
		let counter = 1;
		while (existingRepositories.includes(uniqueName)) {
			uniqueName = `${name}-${counter++}`;
		}

		const repoPath = path.join(REPOSITORIES_PATH, uniqueName);

		try {
			execSync(`git clone "${url}" "${repoPath}"`, { stdio: 'inherit' });
			return { success: true, message: `Repository cloned successfully as ${uniqueName}` };
		} catch (err) {
			throw error(500, `Failed to clone repository: ${err.message}`);
		}
	}
};


