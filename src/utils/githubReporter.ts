/**
 * @file GitHub Reporter — Pushes crash logs to GitHub Issues.
 *
 * Creates a new issue on the configured repository with captured logs
 * and device information.
 */

import { exportLogs, createGitHubIssueBody } from './crashLogger';
import { logger } from './logger';

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = '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';
const REPO_OWNER = 'ShkodnikAI';
const REPO_NAME = 'MIND-MASTERY';

interface GitHubIssueResponse {
  html_url?: string;
  number?: number;
  message?: string;
}

export async function reportToGitHub(
  title: string,
  description?: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const body = createGitHubIssueBody(title, description);

    const response = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'MindMastery-CrashReporter',
        },
        body: JSON.stringify({
          title: `[CRASH] ${title}`,
          body,
          labels: ['bug', 'crash-report'],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        '[githubReporter]',
        `Failed to create issue: ${response.status}`,
        errorText,
      );
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data: GitHubIssueResponse = await response.json();
    logger.info('[githubReporter]', `Issue created: ${data.html_url}`);

    return { success: true, url: data.html_url };
  } catch (error) {
    logger.error('[githubReporter]', 'Failed to report to GitHub', error);
    return { success: false, error: String(error) };
  }
}
