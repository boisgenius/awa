# 半自动 AI 开发流程 (推荐生产使用)

> ✅ **推荐方案**: 结合 AI 效率和人工审查的安全性
>
> AI 负责 80% 的开发工作，人工在关键节点把关

## 概述

AI 负责繁重的开发工作，人工在关键节点把关审查。

```
Issue → AI 开发 → 测试 → [人工审查] → 合并 → 部署 Staging → [人工确认] → 部署生产
```

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         半自动开发架构                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      自动化阶段                                   │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │   Issue ──> OpenClaw 分析 ──> 编写代码 ──> 运行测试               │   │
│  │                                    │                              │   │
│  │                                    ▼                              │   │
│  │                              测试失败? ──Yes──> 自动修复 (迭代)   │   │
│  │                                    │                              │   │
│  │                                    ▼ No                           │   │
│  │                              创建 PR + AI 代码审查                │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                     │                                    │
│                                     ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │               🔒 人工审查检查点 #1                                │   │
│  │                                                                   │   │
│  │   □ 代码逻辑正确性                                                │   │
│  │   □ 安全性检查                                                    │   │
│  │   □ 架构合理性                                                    │   │
│  │   □ 测试覆盖率                                                    │   │
│  │                                                                   │   │
│  │   [Approve] / [Request Changes] / [Reject]                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                     │                                    │
│                                     ▼ Approved                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      自动化阶段                                   │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │   合并 PR ──> 部署 Staging ──> 运行 E2E 测试                     │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                     │                                    │
│                                     ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │               🔒 人工审查检查点 #2 (可选)                         │   │
│  │                                                                   │   │
│  │   □ Staging 环境功能验证                                          │   │
│  │   □ 性能检查                                                      │   │
│  │   □ 用户体验确认                                                  │   │
│  │                                                                   │   │
│  │   [Deploy to Production] / [Rollback]                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                     │                                    │
│                                     ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   部署生产 ──> 健康检查 ──> 通知完成                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 实现方案

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/semi-auto-dev.yml
name: Semi-Auto AI Development

on:
  issues:
    types: [opened, labeled]
  issue_comment:
    types: [created]

env:
  NODE_VERSION: '20'

jobs:
  # ============================================
  # 阶段 1: AI 分析和开发 (自动)
  # ============================================
  ai-develop:
    name: "🤖 AI Development"
    runs-on: ubuntu-latest
    if: |
      (github.event.action == 'labeled' && github.event.label.name == 'ai-task') ||
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@clawbot develop'))
    outputs:
      branch: ${{ steps.branch.outputs.name }}
      has_changes: ${{ steps.changes.outputs.has_changes }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Create branch
        id: branch
        run: |
          BRANCH="ai/issue-${{ github.event.issue.number }}"
          git checkout -b $BRANCH
          echo "name=$BRANCH" >> $GITHUB_OUTPUT

      - name: Notify start
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.issue.number,
              body: `🤖 **AI 开发启动**\n\n正在分析需求并编写代码...\n\n完成后会创建 PR 供您审查。`
            });

      - name: AI Generate Code
        id: generate
        uses: actions/github-script@v7
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          script: |
            const fs = require('fs');
            const https = require('https');

            const issue = context.payload.issue;

            // 读取项目结构
            const { execSync } = require('child_process');
            const fileList = execSync('find src -name "*.ts" -o -name "*.tsx" | head -30').toString();

            const systemPrompt = `你是 Claw Academy 项目的 AI 开发助手。

项目信息:
- 技术栈: Next.js 14, TypeScript, Tailwind CSS, Supabase
- 包结构: @clawacademy/auth, @clawacademy/skills 等
- 测试框架: Vitest

你的任务是根据 Issue 描述实现功能。

输出格式 (JSON):
{
  "files": [
    {
      "path": "相对路径",
      "action": "create" | "modify" | "delete",
      "content": "完整文件内容"
    }
  ],
  "tests": [
    {
      "path": "测试文件路径",
      "content": "测试代码"
    }
  ],
  "summary": "变更摘要",
  "commit_message": "提交信息"
}

要求:
1. 代码要符合 TypeScript 规范
2. 必须包含对应的测试用例
3. 遵循现有代码风格
4. 不要修改不相关的文件`;

            const userPrompt = `
Issue #${issue.number}: ${issue.title}

描述:
${issue.body || '无描述'}

现有文件:
${fileList}

请实现这个需求。`;

            // 调用 Claude API
            const response = await new Promise((resolve, reject) => {
              const req = https.request({
                hostname: 'api.anthropic.com',
                path: '/v1/messages',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': process.env.ANTHROPIC_API_KEY,
                  'anthropic-version': '2023-06-01'
                }
              }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
              });
              req.on('error', reject);
              req.write(JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 8192,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }]
              }));
              req.end();
            });

            const content = response.content?.[0]?.text || '{}';
            const jsonMatch = content.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
              fs.writeFileSync('ai-changes.json', jsonMatch[0]);
              core.setOutput('success', 'true');
            } else {
              core.setOutput('success', 'false');
            }

      - name: Apply changes
        if: steps.generate.outputs.success == 'true'
        run: |
          node -e "
            const fs = require('fs');
            const path = require('path');
            const changes = JSON.parse(fs.readFileSync('ai-changes.json', 'utf8'));

            // 应用文件变更
            for (const file of changes.files || []) {
              const dir = path.dirname(file.path);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              if (file.action === 'delete') {
                fs.unlinkSync(file.path);
              } else {
                fs.writeFileSync(file.path, file.content);
              }
              console.log(\`\${file.action}: \${file.path}\`);
            }

            // 应用测试文件
            for (const test of changes.tests || []) {
              const dir = path.dirname(test.path);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              fs.writeFileSync(test.path, test.content);
              console.log(\`test: \${test.path}\`);
            }
          "

      - name: Run tests
        id: test
        continue-on-error: true
        run: |
          pnpm test --reporter=verbose 2>&1 | tee test-output.txt
          echo "exit_code=$?" >> $GITHUB_OUTPUT

      - name: Run lint
        continue-on-error: true
        run: pnpm lint --fix

      - name: Check for changes
        id: changes
        run: |
          if [[ -n $(git status --porcelain) ]]; then
            echo "has_changes=true" >> $GITHUB_OUTPUT
          else
            echo "has_changes=false" >> $GITHUB_OUTPUT
          fi

      - name: Commit changes
        if: steps.changes.outputs.has_changes == 'true'
        run: |
          git config user.name "ClawBot"
          git config user.email "bot@clawacademy.dev"
          git add -A
          COMMIT_MSG=$(node -e "const c = JSON.parse(require('fs').readFileSync('ai-changes.json')); console.log(c.commit_message || 'feat: AI implementation')")
          git commit -m "$COMMIT_MSG"
          git push origin ${{ steps.branch.outputs.name }}

  # ============================================
  # 阶段 2: 创建 PR (自动)
  # ============================================
  create-pr:
    name: "📝 Create PR"
    needs: ai-develop
    if: needs.ai-develop.outputs.has_changes == 'true'
    runs-on: ubuntu-latest
    outputs:
      pr_number: ${{ steps.pr.outputs.number }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ needs.ai-develop.outputs.branch }}

      - name: Create Pull Request
        id: pr
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            let summary = 'AI 生成的代码变更';
            try {
              const changes = JSON.parse(fs.readFileSync('ai-changes.json', 'utf8'));
              summary = changes.summary || summary;
            } catch (e) {}

            const pr = await github.rest.pulls.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `🤖 AI: ${context.payload.issue.title}`,
              head: '${{ needs.ai-develop.outputs.branch }}',
              base: 'main',
              body: `## 🤖 AI 生成的 PR

### 关联 Issue
Closes #${context.payload.issue.number}

### 变更摘要
${summary}

### AI 开发说明
- 此 PR 由 ClawBot AI 自动生成
- 代码已通过自动化测试
- **请仔细审查后再合并**

### 检查清单
- [ ] 代码逻辑正确
- [ ] 无安全隐患
- [ ] 测试覆盖充分
- [ ] 符合代码规范

---
🤖 Generated by ClawBot | [半自动开发流程](../docs/modular-design/auto-dev-semi.md)`
            });

            // 添加标签
            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: pr.data.number,
              labels: ['ai-generated', 'needs-review']
            });

            // 请求审查
            try {
              await github.rest.pulls.requestReviewers({
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: pr.data.number,
                reviewers: ['maintainer-username']  // 替换为实际维护者
              });
            } catch (e) {
              console.log('Could not request reviewers:', e.message);
            }

            core.setOutput('number', pr.data.number);

      - name: Notify PR created
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.issue.number,
              body: `✅ **AI 开发完成**

PR 已创建: #${{ steps.pr.outputs.number }}

**下一步**: 请审查 PR 并决定是否合并。

---
🔒 半自动流程: 需要人工审查后才能合并`
            });

  # ============================================
  # 阶段 3: AI 代码审查 (自动)
  # ============================================
  ai-review:
    name: "🔍 AI Code Review"
    needs: create-pr
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get PR diff
        id: diff
        run: |
          gh pr diff ${{ needs.create-pr.outputs.pr_number }} > pr-diff.txt
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: AI Review
        uses: actions/github-script@v7
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          script: |
            const fs = require('fs');
            const https = require('https');

            const diff = fs.readFileSync('pr-diff.txt', 'utf8').slice(0, 10000);

            const systemPrompt = `你是代码审查专家。审查这个 PR 的代码变更。

关注:
1. 逻辑错误
2. 安全漏洞 (XSS, 注入等)
3. 性能问题
4. TypeScript 类型安全
5. 测试覆盖

输出格式:
## 审查结果

### 发现的问题
- 🔴 严重: (如有)
- 🟡 警告: (如有)
- 🔵 建议: (如有)

### 总体评价
[简短评价]

### 建议
✅ 可以合并 / ⚠️ 建议修改后合并 / ❌ 需要重大修改`;

            const response = await new Promise((resolve, reject) => {
              const req = https.request({
                hostname: 'api.anthropic.com',
                path: '/v1/messages',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': process.env.ANTHROPIC_API_KEY,
                  'anthropic-version': '2023-06-01'
                }
              }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
              });
              req.on('error', reject);
              req.write(JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2048,
                system: systemPrompt,
                messages: [{ role: 'user', content: `请审查以下代码变更:\n\n${diff}` }]
              }));
              req.end();
            });

            const review = response.content?.[0]?.text || '无法生成审查';

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: ${{ needs.create-pr.outputs.pr_number }},
              body: `## 🤖 AI 代码审查\n\n${review}\n\n---\n*此审查由 AI 生成，请人工确认后再做决定*`
            });

  # ============================================
  # 阶段 4: 合并后部署到 Staging (自动)
  # ============================================
  deploy-staging:
    name: "🚀 Deploy to Staging"
    needs: create-pr
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    environment: staging

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Staging
        run: |
          vercel --token ${{ secrets.VERCEL_TOKEN }} \
            --env ENVIRONMENT=staging \
            --confirm

      - name: Run E2E Tests
        run: |
          pnpm test:e2e --base-url=${{ steps.deploy.outputs.url }}

      - name: Notify staging ready
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: ${{ needs.create-pr.outputs.pr_number }},
              body: `🎉 **已部署到 Staging**

URL: ${{ steps.deploy.outputs.url }}

E2E 测试: ✅ 通过

**下一步**:
1. 在 Staging 环境验证功能
2. 确认无问题后，点击下方按钮部署到生产

[部署到生产](../actions/workflows/deploy-production.yml)`
            });
```

### 2. 生产部署 (需手动触发)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      pr_number:
        description: 'PR Number to deploy'
        required: true
      confirm:
        description: 'Type "DEPLOY" to confirm'
        required: true

jobs:
  deploy:
    name: "🚀 Deploy to Production"
    runs-on: ubuntu-latest
    if: github.event.inputs.confirm == 'DEPLOY'
    environment: production

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Production
        run: |
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

      - name: Health Check
        run: |
          sleep 30
          curl -f https://claw.academy/api/health || exit 1

      - name: Notify success
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: ${{ github.event.inputs.pr_number }},
              body: `🎉 **已部署到生产环境**

URL: https://claw.academy

部署时间: ${new Date().toISOString()}
部署人: @${{ github.actor }}`
            });
```

### 3. OpenClaw 半自动配置

```typescript
// services/semi-auto-agent.ts
import { OpenClaw } from 'openclaw';

const claw = new OpenClaw();

// 半自动模式: 开发后等待审批
claw.on('github:issue:labeled', async (event) => {
  if (event.label.name !== 'ai-task') return;

  const result = await claw.chat(`
你是 Claw Academy 的开发助手。

任务: ${event.issue.title}
描述: ${event.issue.body}

请完成以下步骤:
1. 分析需求
2. 编写代码实现
3. 编写测试用例
4. 运行测试确保通过
5. 创建 PR (不要合并!)
6. 等待人工审查

注意:
- 只创建 PR，不要自动合并
- 在 PR 描述中清楚说明变更内容
- 标记 PR 需要审查
  `);

  // 通知开发完成，等待审查
  await notifySlack(`
📝 AI 已完成 Issue #${event.issue.number} 的开发
PR 已创建，等待人工审查
  `);
});

// 审批后自动部署到 Staging
claw.on('github:pr:approved', async (event) => {
  if (!event.pull_request.labels.includes('ai-generated')) return;

  await claw.chat(`
PR #${event.pull_request.number} 已获批准。

请执行:
1. 合并 PR 到 main
2. 部署到 Staging 环境
3. 运行 E2E 测试
4. 报告部署结果

不要部署到生产环境，等待进一步确认。
  `);
});

// 生产部署需要明确命令
claw.on('message', async (msg) => {
  if (msg.text.includes('deploy to production') && msg.text.includes('confirm')) {
    const prMatch = msg.text.match(/PR #(\d+)/);
    if (prMatch) {
      await claw.chat(`
收到生产部署确认。

请执行:
1. 部署 PR #${prMatch[1]} 到生产环境
2. 运行健康检查
3. 如果失败，自动回滚
4. 报告部署结果
      `);
    }
  }
});
```

---

## 人工审查清单

### PR 审查要点

```markdown
## 代码审查清单

### 功能性
- [ ] 代码实现了 Issue 中描述的需求
- [ ] 边界情况已处理
- [ ] 错误处理完善

### 安全性
- [ ] 无 XSS 漏洞
- [ ] 无 SQL 注入
- [ ] 无敏感信息泄露
- [ ] 输入已验证

### 代码质量
- [ ] TypeScript 类型正确
- [ ] 无明显的代码坏味道
- [ ] 符合项目代码规范

### 测试
- [ ] 有对应的单元测试
- [ ] 测试覆盖关键路径
- [ ] 测试可以独立运行

### 其他
- [ ] 无不必要的依赖
- [ ] 无调试代码残留
- [ ] 文档已更新 (如需要)
```

### Staging 验证要点

```markdown
## Staging 验证清单

- [ ] 功能按预期工作
- [ ] UI 显示正常
- [ ] 无 console 错误
- [ ] 响应时间可接受
- [ ] 移动端适配正常
- [ ] 与现有功能无冲突
```

---

## 使用流程

### 开发者视角

```
1. 创建 Issue，描述需求
         ↓
2. 添加 "ai-task" 标签
         ↓
3. AI 自动开发，创建 PR
         ↓
4. 收到通知，审查 PR
         ↓
5. Approve 或 Request Changes
         ↓
6. 合并后自动部署 Staging
         ↓
7. 验证 Staging
         ↓
8. 确认部署生产
```

### 命令速查

| 操作 | 触发方式 |
|------|----------|
| 启动 AI 开发 | 添加 `ai-task` 标签 |
| 重新生成 | 评论 `@clawbot regenerate` |
| 部署生产 | 手动触发 workflow |
| 回滚 | 评论 `@clawbot rollback` |

---

## 与全自动的对比

| 特性 | 全自动 | 半自动 (推荐) |
|------|--------|---------------|
| 开发速度 | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡ |
| 安全性 | ⚠️ | ✅✅✅ |
| 代码质量 | ❓ | ✅✅ |
| 人工投入 | 0% | ~10-20% |
| 适合场景 | 原型/个人项目 | 团队/生产项目 |
| 出错恢复 | 困难 | 容易 |

---

## 检查清单

部署半自动流程前:

- [ ] GitHub Actions secrets 配置完成
- [ ] Vercel 项目配置完成
- [ ] Staging 环境就绪
- [ ] 通知渠道 (Slack/Discord) 配置
- [ ] 代码审查人员指定
- [ ] 审查清单文档化
- [ ] 回滚流程文档化
