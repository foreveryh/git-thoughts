const fetch = require('node-fetch');
const fs = require('fs');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO;

async function fetchIssues() {
  console.log(`🔍 Fetching issues from repo: ${REPO}`);
  console.log(`🔑 Using token: ${GITHUB_TOKEN ? 'Token provided' : 'No token found!'}`);
  
  const issues = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/repos/${REPO}/issues?state=open&labels=Public&per_page=100&page=${page}`;
    console.log(`📡 Fetching page ${page}: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    });
    
    if (!res.ok) {
      console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
      const errorBody = await res.text();
      console.error(`Error details: ${errorBody}`);
      throw new Error(`GitHub API request failed: ${res.status}`);
    }
    
    const data = await res.json();
    console.log(`📄 Received ${data.length} issues on page ${page}`);
    
    if (data.length === 0) break;
    
    data.forEach(issue => {
      console.log(`  📝 Issue #${issue.number}: ${issue.title}`);
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
  
  console.log(`📊 Total issues found: ${issues.length}`);
  return issues;
}

async function main() {
  try {
    console.log('🚀 Starting sync process...');
    const issues = await fetchIssues();

    // 🔒 关键：确保 public 目录一定存在
    console.log('📁 Creating public directory...');
    fs.mkdirSync('public', { recursive: true });

    const jsonContent = JSON.stringify(issues, null, 2);
    fs.writeFileSync('public/issues.json', jsonContent);
    
    console.log(`✅ Successfully saved ${issues.length} public issues to public/issues.json`);
    console.log(`📄 File size: ${jsonContent.length} characters`);
    
    // Verify the file was created
    if (fs.existsSync('public/issues.json')) {
      console.log('✅ File verification: public/issues.json exists');
    } else {
      console.error('❌ File verification: public/issues.json was not created!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during sync process:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

main();