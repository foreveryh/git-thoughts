自动整理每日 Issues 生成 JSON

⸻

🗺️ 全流程步骤图

Step 1️⃣：准备 GitHub Token → 供脚本调用 API
Step 2️⃣：配置 Actions Workflow → 自动/手动同步
Step 3️⃣：准备 fetch_issues.js 脚本 → 拉取 Issues + 生成 issues.json
Step 4️⃣：测试 Actions 手动跑一遍 → 确认 public/issues.json 正常生成
Step 5️⃣（选做）：Blog 端配置 fetch issues.json 展示


⸻

🎬 Step 1️⃣：准备 GitHub Token

1️⃣ 进入 GitHub → 右上头像 → Settings
2️⃣ 左侧 Developer Settings → Personal access tokens → Tokens (classic)
3️⃣ 生成新 token（generate new token） → classic token 就行
4️⃣ 勾选权限：

✅ repo（拉取 Issues 需要）
✅ read:org（如果你的 repo 是组织的）
✅ read:user（默认会勾）

有效期 → 选 90 天 / 180 天 / no expiration（随你）

5️⃣ 生成完 token，复制好 token 内容（注意：只能复制一次）

⸻

🛠 Step 2️⃣：配置 Actions Workflow

接下来你要：

1️⃣ 在 git-thoughts repo 里新建目录：

.github/workflows/

2️⃣ 新建一个文件：

.github/workflows/sync-issues.yml

内容如下（我给你准备好了 ready-to-use 版本）：

name: Sync Public Issues to issues.json

on:
  workflow_dispatch: # 手动按钮
  schedule:
    - cron: '0 2 * * *' # 每天凌晨 2 点同步一次，UTC 时间 → 对应法国是 4 点左右

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm install node-fetch@2

      - name: Run Sync Script
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: foreveryh/git-thoughts
        run: node fetch_issues.js

      - name: Commit and Push issues.json
        run: |
          git config --global user.email "you@example.com"
          git config --global user.name "GitHub Action"
          git add public/issues.json
          git commit -m "chore: update issues.json [skip ci]" || echo "No changes to commit"
          git push

解释：
	•	会安装 node-fetch → 用来拉取 GitHub Issues
	•	会运行你自己的 fetch_issues.js 脚本 → 生成 public/issues.json
	•	会自动 commit + push 到 git-thoughts repo
	•	手动 / 每天凌晨 2 点自动跑

⸻

💻 Step 3️⃣：准备 fetch_issues.js 脚本

你在 repo 根目录新建：

fetch_issues.js

内容如下（我给你一份 ready-to-use 版）：

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
  fs.writeFileSync('public/issues.json', JSON.stringify(issues, null, 2));
  console.log(`Fetched ${issues.length} public issues.`);
}

main();


⸻

🔐 Step 4️⃣：配置 GitHub Secrets

在 git-thoughts repo → Settings → Secrets → Actions → New repository secret：
	•	Name: GITHUB_TOKEN
	•	Value: 你刚才复制的 token

→ 存好，Actions 就能用了。

⸻

✅ Step 5️⃣：手动测试一次 Actions

1️⃣ 进入 git-thoughts repo → Actions
2️⃣ 你会看到 Sync Public Issues to issues.json Workflow 出现
3️⃣ 点击 → Run workflow → 手动点一下

→ 等待执行完成 → 你会看到：

Fetched X public issues.

→ Repo 里 public/issues.json 出现了 → 成功！

⸻

Blog 端如何读取

export async function getStaticProps() {
  const res = await fetch('https://raw.githubusercontent.com/foreveryh/git-thoughts/main/public/issues.json');
  const issues = await res.json();

  return {
    props: {
      issues,
    },
    revalidate: 3600, // 1 小时更新一次
  };
}


⸻

小总结

✅ 方案你选对了，Public/issues.json → 博客直接 fetch
✅ Actions 可以手动 + 定时跑
✅ issues.json 始终覆盖更新
✅ Blog 端 fetch 固定 URL → 高效、可控

⸻

你只需要按我这个步骤一步步来：

1️⃣ 配 token
2️⃣ 配 .github/workflows/sync-issues.yml
3️⃣ 配 fetch_issues.js
4️⃣ 配 GitHub Secret
5️⃣ 手动跑一次测试

⸻

要不要我现在把 完整代码包 + 目录结构示意图 帮你一键整理发一份？你 copy 过去就能直接用 🚀。
你一说 OK，我就发「最终 ready-to-use 版」→ 保证你 15 分钟内上线 ✌️。要不要继续？🚀🚀🚀