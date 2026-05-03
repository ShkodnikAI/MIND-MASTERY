/**
 * @file Setup GitHub Labels — Creates 'bug' and 'crash-report' labels.
 *
 * Run with: npx tsx scripts/setup-github-labels.ts
 */

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = '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';
const REPO_OWNER = 'ShkodnikAI';
const REPO_NAME = 'MIND-MASTERY';

const LABELS = [
  { name: 'bug', color: 'd73a4a', description: 'Something is not working' },
  {
    name: 'crash-report',
    color: 'b60205',
    description: 'Auto-reported crash log from the app',
  },
];

async function ensureLabels() {
  for (const label of LABELS) {
    const response = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/labels`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(label),
      },
    );
    if (response.ok) {
      console.log(`✅ Label "${label.name}" ready`);
    } else {
      console.log(
        `⚠️  Label "${label.name}" may already exist or error: ${response.status}`,
      );
    }
  }
}

ensureLabels().catch(console.error);
