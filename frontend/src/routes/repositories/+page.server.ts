import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import type { PageLoad } from './$types';

interface GitRepositoryInfo {
    name: string;
    path: string;
    lastCommitHash: string;
    lastCommitMessage: string;
    lastCommitDate: string;
    remoteUrl: string | null;
}

function getGitRepositoryInfo(repoPath: string): GitRepositoryInfo | null {
    try {
        const name = path.basename(repoPath);

        // Get last commit hash
        const lastCommitHash = execSync('git rev-parse HEAD', { cwd: repoPath }).toString().trim();

        // Get last commit message
        const lastCommitMessage = execSync('git log -1 --pretty=%B', { cwd: repoPath }).toString().trim();

        // Get last commit date
        const lastCommitDate = execSync('git log -1 --pretty=%cd', { cwd: repoPath }).toString().trim();

        // Get remote URL (if exists)
        let remoteUrl: string | null = null;
        try {
            remoteUrl = execSync('git remote get-url origin', { cwd: repoPath }).toString().trim();
        } catch {
            remoteUrl = null; // No remote configured
        }

        return { name, path: repoPath, lastCommitHash, lastCommitMessage, lastCommitDate, remoteUrl };
    } catch {
        return null; // Not a valid git repository
    }
}

export const load: PageLoad = () => {
    try {
        const homeDir = os.homedir();
        const repoPath = path.join(homeDir, 'repositories');

        if (!fs.existsSync(repoPath)) {
            return { data: [] };
        }

        const repositories = fs.readdirSync(repoPath)
            .filter(file => fs.statSync(path.join(repoPath, file)).isDirectory())
            .map(dir => getGitRepositoryInfo(path.join(repoPath, dir)))
            .filter((repo): repo is GitRepositoryInfo => repo !== null); // Remove null values

        return { data: repositories };
    } catch (err) {
        throw error(500, 'Failed to read repositories');
    }
};
