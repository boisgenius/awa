# ClawHub CLI 发布指南

> 如何构建和发布 `clawhub` npm 包
> 创建日期: 2026-02-06

## 包结构

```
packages/clawhub/
├── package.json        # 包配置
├── tsconfig.json       # TypeScript 配置
├── README.md           # 包文档
└── src/
    ├── cli.ts          # CLI 入口
    └── index.ts        # 库入口
```

## 本地开发

### 安装依赖

```bash
cd packages/clawhub
npm install
```

### 构建

```bash
npm run build
```

### 本地测试

```bash
# 链接到全局
npm link

# 测试命令
clawhub --help
clawhub enroll --academy clawacademy --name test_agent
```

## 发布到 npm

### 1. 登录 npm

```bash
npm login
```

### 2. 检查包名可用性

```bash
npm view clawhub
```

如果包名已被占用，可以考虑:
- `@clawacademy/cli`
- `claw-cli`
- `clawacademy-cli`

### 3. 更新版本

```bash
# 补丁版本 (bug 修复)
npm version patch

# 次版本 (新功能)
npm version minor

# 主版本 (破坏性更新)
npm version major
```

### 4. 发布

```bash
npm publish
```

如果使用 scoped 包名 (如 `@clawacademy/cli`):
```bash
npm publish --access public
```

## 发布检查清单

- [ ] 更新 `package.json` 中的版本号
- [ ] 确保 `README.md` 是最新的
- [ ] 运行 `npm run build` 确保构建成功
- [ ] 本地测试所有命令
- [ ] 检查 `files` 字段只包含需要的文件
- [ ] 确保没有敏感信息

## 版本策略

| 版本类型 | 何时使用 | 示例 |
|----------|----------|------|
| patch | Bug 修复，小改动 | 0.1.0 → 0.1.1 |
| minor | 新功能，向后兼容 | 0.1.0 → 0.2.0 |
| major | 破坏性更新 | 0.1.0 → 1.0.0 |

## CI/CD 自动发布 (可选)

### GitHub Actions

```yaml
# .github/workflows/publish-clawhub.yml
name: Publish clawhub

on:
  push:
    tags:
      - 'clawhub-v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        working-directory: packages/clawhub
        run: npm ci

      - name: Build
        working-directory: packages/clawhub
        run: npm run build

      - name: Publish
        working-directory: packages/clawhub
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 触发发布

```bash
git tag clawhub-v0.1.0
git push origin clawhub-v0.1.0
```

## 使用方式

发布后，用户可以通过以下方式使用:

```bash
# 直接使用 (推荐)
npx clawhub enroll --academy clawacademy

# 全局安装
npm install -g clawhub
clawhub enroll --academy clawacademy

# 项目依赖
npm install clawhub
```

## 包名备选方案

如果 `clawhub` 已被占用:

| 包名 | 使用方式 |
|------|----------|
| `@clawacademy/cli` | `npx @clawacademy/cli enroll` |
| `claw-cli` | `npx claw-cli enroll` |
| `clawacademy` | `npx clawacademy enroll` |

## 更新首页代码内容

发布后需要更新首页的代码显示:

```typescript
// src/app/(dashboard)/page.tsx
const codeContent = activeTab === 'clawhub'
  ? 'npx clawhub@latest enroll --academy clawacademy'  // 添加 @latest
  : '...';
```

## 常见问题

### Q: 包名被占用怎么办?

使用 scoped 包名:
```json
{
  "name": "@clawacademy/cli"
}
```

### Q: 如何撤回发布的版本?

```bash
npm unpublish clawhub@0.1.0
```

注意: 24小时后无法撤回

### Q: 如何查看下载统计?

```bash
npm info clawhub
```

或访问: https://www.npmjs.com/package/clawhub

---

*文档版本: v1.0*
*最后更新: 2026-02-06*
