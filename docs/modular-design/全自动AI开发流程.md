# 全自动 AI 开发流程 (Vibe Coding)

> ⚠️ **警告**: 此方案风险较高，仅适用于个人项目、原型开发或有完善回滚机制的环境
>
> 参考: Moltbook 采用此方式开发，导致 150K API Key 泄露

## 概述

完全自动化的 AI 开发流程，从 Issue 到部署全程无人工干预。

```
Issue → AI 开发 → 测试 → 合并 → 部署 → 通知
         ↑______ 自动迭代 ______↓
```

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         全自动开发架构                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐ │
│  │   GitHub     │────>│   Webhook    │────>│   OpenClaw Agent         │ │
│  │   Issue      │     │   Server     │     │   (本地/云端运行)         │ │
│  └──────────────┘     └──────────────┘     └────────────┬─────────────┘ │
│                                                          │               │
│                                                          ▼               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        开发循环                                    │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │  │
│  │  │ 分析    │─>│ 编码    │─>│ 测试    │─>│ 修复    │─>│ 提交    │ │  │
│  │  │ 需求    │  │         │  │         │  │ (迭代)  │  │         │ │  │
│  │  └─────────┘  └─────────┘  └────┬────┘  └────▲────┘  └─────────┘ │  │
│  │                                  │           │                    │  │
│  │                                  └───失败────┘                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                          │               │
│                                                          ▼               │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐ │
│  │   自动合并   │────>│   自动部署   │────>│   通知 (Slack/Discord)   │ │
│  │   到 main    │     │   Vercel     │     │                          │ │
│  └──────────────┘     └──────────────┘     └──────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 实现方案

### 1. OpenClaw 配置

```yaml
# ~/.openclaw/config.yaml
name: claw-academy-dev-agent
model: claude-sonnet-4-20250514

# 启用的工具
tools:
  allow:
    - read
    - write
    - edit
    - apply_patch
    - exec
    - bash
    - web_search
    - web_fetch
    - browser
    - message

# 工作区
workspace: ~/projects/claw-academy

# 安全设置 (全自动模式放宽限制)
security:
  allow_exec: true
  allow_network: true
  sandbox: docker  # 仍然在 Docker 中运行
```

### 2. 自动开发服务

```typescript
// services/auto-dev-agent.ts
import { OpenClaw } from 'openclaw';
import { Octokit } from '@octokit/rest';
import express from 'express';

const app = express();
const claw = new OpenClaw();
const github = new Octokit({ auth: process.env.GITHUB_TOKEN });

// GitHub Webhook 处理
app.post('/webhook', express.json(), async (req, res) => {
  const { action, issue, repository } = req.body;

  // Issue 创建时自动开发
  if (action === 'opened' && issue.labels?.some(l => l.name === 'auto-dev')) {
    res.status(200).send('Processing');
    await handleAutoDev(issue, repository);
    return;
  }

  // 评论触发
  if (action === 'created' && req.body.comment?.body?.includes('@clawbot auto')) {
    res.status(200).send('Processing');
    await handleAutoDev(issue, repository);
    return;
  }

  res.status(200).send('Ignored');
});

async function handleAutoDev(issue: any, repo: any) {
  const startTime = Date.now();

  try {
    // 通知开始
    await commentOnIssue(issue.number, `
🤖 **全自动开发启动**

我将自动完成以下步骤:
1. 分析需求
2. 编写代码
3. 运行测试
4. 自动部署

请稍候...
    `);

    // 发送任务给 OpenClaw
    const result = await claw.chat(`
你是 Claw Academy 的全自动开发 Agent。

## 任务
${issue.title}

## 详细描述
${issue.body || '无详细描述'}

## 要求
1. 切换到项目目录: cd ~/projects/claw-academy
2. 拉取最新代码: git pull origin main
3. 创建功能分支: git checkout -b auto/${issue.number}
4. 分析需求并实现功能
5. 编写对应的测试用例
6. 运行测试: pnpm test
7. 如果测试失败，分析错误并修复，重复直到通过
8. 运行 lint: pnpm lint --fix
9. 运行类型检查: pnpm type-check
10. 提交代码: git add -A && git commit -m "feat: ${issue.title} (auto #${issue.number})"
11. 推送分支: git push origin auto/${issue.number}
12. 合并到 main: git checkout main && git merge auto/${issue.number} && git push
13. 部署: pnpm deploy 或 vercel --prod
14. 验证部署成功

## 限制
- 最多迭代 10 次修复测试
- 单个文件不超过 500 行
- 不修改核心配置文件 (.env, package.json 的 scripts 除外)

## 输出
完成后返回:
- 修改的文件列表
- 测试结果
- 部署 URL
- 遇到的问题和解决方案
    `);

    // 解析结果
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    // 关闭 Issue
    await github.rest.issues.update({
      owner: repo.owner.login,
      repo: repo.name,
      issue_number: issue.number,
      state: 'closed',
    });

    // 通知完成
    await commentOnIssue(issue.number, `
✅ **全自动开发完成**

⏱️ 耗时: ${duration} 分钟

${result}

---
🤖 由 ClawBot 全自动完成
    `);

    // Slack 通知
    await notifySlack(`
✅ Issue #${issue.number} 已自动完成并部署
标题: ${issue.title}
耗时: ${duration} 分钟
    `);

  } catch (error) {
    // 错误处理
    await commentOnIssue(issue.number, `
❌ **全自动开发失败**

错误信息:
\`\`\`
${error.message}
\`\`\`

请人工检查或重试。
    `);

    // 添加需要人工介入的标签
    await github.rest.issues.addLabels({
      owner: repo.owner.login,
      repo: repo.name,
      issue_number: issue.number,
      labels: ['needs-human'],
    });
  }
}

async function commentOnIssue(issueNumber: number, body: string) {
  await github.rest.issues.createComment({
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    issue_number: issueNumber,
    body,
  });
}

async function notifySlack(message: string) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });
}

app.listen(3000, () => console.log('Auto-dev agent running on :3000'));
```

### 3. GitHub Actions (备用方案)

```yaml
# .github/workflows/full-auto-dev.yml
name: Full Auto Development

on:
  issues:
    types: [opened, labeled]
  issue_comment:
    types: [created]

jobs:
  auto-develop:
    runs-on: ubuntu-latest
    if: |
      (github.event.action == 'labeled' && github.event.label.name == 'full-auto') ||
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@clawbot full-auto'))

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.PAT_TOKEN }}  # 需要有 push 权限的 token
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: AI Development
        id: develop
        uses: actions/github-script@v7
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          script: |
            // 完整的 AI 开发逻辑
            // ... (类似上面的实现)

      - name: Run Tests
        run: pnpm test

      - name: Run Lint
        run: pnpm lint

      - name: Commit and Push
        run: |
          git config user.name "ClawBot"
          git config user.email "bot@clawacademy.dev"
          git add -A
          git commit -m "feat: auto-implement #${{ github.event.issue.number }}" || exit 0
          git push

      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

      - name: Close Issue
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.update({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.issue.number,
              state: 'closed'
            });

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.issue.number,
              body: '✅ 已自动完成并部署!'
            });
```

### 4. 定时自动维护

```typescript
// services/auto-maintenance.ts
import { OpenClaw } from 'openclaw';

const claw = new OpenClaw();

// 每天凌晨 3 点自动维护
claw.cron('0 3 * * *', async () => {
  await claw.chat(`
执行每日自动维护:

1. 拉取最新代码
2. 检查并更新依赖 (pnpm update)
3. 运行完整测试套件
4. 如有失败的测试，尝试修复
5. 运行安全扫描 (pnpm audit)
6. 修复安全漏洞
7. 生成更新日志
8. 提交并部署
9. 发送维护报告到 Slack
  `);
});

// 每周日自动重构
claw.cron('0 2 * * 0', async () => {
  await claw.chat(`
执行每周代码优化:

1. 分析代码复杂度
2. 识别重复代码
3. 重构优化
4. 更新文档
5. 确保测试通过
6. 提交并部署
  `);
});
```

---

## 安全措施 (即使全自动也需要)

### 1. Docker 沙箱

```yaml
# docker-compose.yml
version: '3.8'
services:
  openclaw-agent:
    image: openclaw/agent:latest
    volumes:
      - ./workspace:/workspace
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    networks:
      - isolated
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G

networks:
  isolated:
    driver: bridge
```

### 2. 自动回滚

```typescript
// 部署失败自动回滚
async function deployWithRollback() {
  const previousCommit = await exec('git rev-parse HEAD~1');

  try {
    await exec('vercel --prod');
    await healthCheck('https://claw.academy');
  } catch (error) {
    console.log('部署失败，自动回滚...');
    await exec(`git revert HEAD --no-edit`);
    await exec('git push');
    await exec('vercel --prod');
    throw error;
  }
}
```

### 3. 限制范围

```typescript
// 禁止修改的文件
const PROTECTED_FILES = [
  '.env*',
  '.github/workflows/*.yml',
  'docker-compose.yml',
  'vercel.json',
  'package.json',  // 只允许修改 dependencies
];

// 禁止执行的命令
const BANNED_COMMANDS = [
  'rm -rf',
  'DROP TABLE',
  'DELETE FROM',
  'format',
  ':(){:|:&};:',  // fork bomb
];
```

### 4. 监控告警

```typescript
// 异常检测
const monitor = {
  maxIterations: 10,      // 最大迭代次数
  maxDuration: 30 * 60,   // 最长运行时间 (秒)
  maxFilesChanged: 20,    // 最多修改文件数
  maxLinesChanged: 1000,  // 最多修改行数
};

// 超出限制自动停止并告警
```

---

## 使用方式

### 触发全自动开发

**方式 1: 标签触发**
```
1. 创建 Issue
2. 添加 "full-auto" 标签
3. 等待完成
```

**方式 2: 评论触发**
```
在 Issue 中评论: @clawbot full-auto
```

**方式 3: API 触发**
```bash
curl -X POST https://your-webhook.com/auto-dev \
  -H "Content-Type: application/json" \
  -d '{"task": "添加用户头像上传功能"}'
```

---

## 适用场景

| 场景 | 适合度 | 说明 |
|------|--------|------|
| 个人项目 | ⭐⭐⭐⭐⭐ | 风险自担 |
| 原型开发 | ⭐⭐⭐⭐⭐ | 快速验证 |
| 内部工具 | ⭐⭐⭐⭐ | 影响有限 |
| 开源项目 | ⭐⭐⭐ | 需要审查机制 |
| 商业产品 | ⭐⭐ | 不推荐 |
| 金融/医疗 | ⭐ | 强烈不推荐 |

---

## 风险提示

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️  全自动开发的风险                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 安全漏洞可能直接上线                                         │
│  2. AI 幻觉导致错误代码部署                                      │
│  3. 无人监督可能导致失控                                         │
│  4. 难以追踪和审计变更                                           │
│  5. 出问题时可能难以恢复                                         │
│                                                                  │
│  建议: 至少保留自动回滚和告警机制                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 检查清单

部署全自动开发前，确保:

- [ ] Docker 沙箱配置完成
- [ ] 自动回滚机制就绪
- [ ] 监控告警配置完成
- [ ] 敏感文件保护列表
- [ ] Slack/Discord 通知配置
- [ ] 定期备份机制
- [ ] 紧急停止按钮
