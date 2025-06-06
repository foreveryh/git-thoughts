const fetch = require('node-fetch');
const fs = require('fs');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO;

async function fetchIssues() {
  const issues = [];
  let page = 1;
  while (true) {
    const res = await fetch(`https://api.github.com/repos/${REPO}/issues?state=open&labels=Public&per_page=100&page=${page}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    });
    const data = await res.json();
    if (data.length === 0) break;
    data.forEach(issue => {
      issues.push({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        url: issue.html_url,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        tags: issue.labels.map(label => label.name).filter(name => name !== 'Public') // 只保留内容标签
      });
    });
    page++;
  }
  return issues;
}

async function main() {
  const issues = await fetchIssues();

  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }

  fs.writeFileSync('public/issues.json', JSON.stringify(issues, null, 2));
  console.log(`✅ Fetched ${issues.length} public issues.`);
}