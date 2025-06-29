# GitHub Actions 工作流优化说明

## 🎯 优化目标

1. **避免不必要的触发** - 减少 GitHub Actions 使用量
2. **确保安全性** - 绝不关闭仓库所有者的 Issues
3. **提高效率** - 只在真正需要的时候才同步

## 📋 当前触发策略

### 同步工作流 (`sync-issues.yml`)

**触发条件：**
- ✅ **定时任务** - 每天凌晨 2 点 UTC（确保数据同步）
- ✅ **手动触发** - 管理员需要时手动同步
- ✅ **Issues 内容变化** - 仅当同时满足以下条件：
  - Issue 带有 `Public` 标签
  - 操作类型是 `opened`（新建）或 `edited`（编辑）
  - **不包含** `labeled`/`unlabeled` 操作

**不会触发的操作：**
- ❌ 仅添加/删除标签
- ❌ 关闭/重新打开 Issues
- ❌ 分配/取消分配
- ❌ 里程碑变更

### 关闭外部 Issues 工作流 (`close_external_issues.yml`)

**触发条件：**
- ✅ **只有外部用户创建新 Issue 时**

**安全检查：**
- ✅ **双重验证** - 通过用户名和用户ID确保不是仓库所有者
- ✅ **保护标签** - 不关闭带有 `blog-post` 标签的 Issues
- ✅ **详细日志** - 记录所有决策过程

**绝不会关闭：**
- ❌ 仓库所有者创建的任何 Issues
- ❌ 带有 `blog-post` 标签的 Issues（来自博客的反馈）

## 🔧 并发控制

### 同步工作流
```yaml
concurrency:
  group: sync-issues
  cancel-in-progress: false  # 排队等待，不取消正在运行的任务
```

### 延迟策略
- Issue 事件触发时等待 10 秒，避免连续快速触发

## 📊 预期 Actions 使用量

**之前可能的问题：**
- 每次标签操作都触发同步 → 大量不必要的运行
- 可能意外关闭自己的 Issues

**优化后：**
- 只有真正的内容变化才触发同步
- 增强的安全检查确保不会误关闭
- 预计减少 70%+ 的不必要运行

## 🧪 测试建议

1. **测试同步触发：**
   ```
   1. 创建带有 Public 标签的新 Issue → 应该触发同步
   2. 编辑带有 Public 标签的 Issue → 应该触发同步
   3. 仅给 Issue 添加标签 → 不应该触发同步
   4. 关闭/重新打开 Issue → 不应该触发同步
   ```

2. **测试关闭逻辑：**
   ```
   1. 用其他账号创建 Issue → 应该被关闭
   2. 用自己账号创建 Issue → 绝不应该被关闭
   3. 创建带有 blog-post 标签的 Issue → 不应该被关闭
   ```

## 🚀 进一步优化建议

1. **条件同步** - 考虑检查 Issue 内容是否真正发生变化
2. **智能标签** - 可以考虑自动给自己的 Issues 加上特定标签
3. **分时同步** - 在使用量较少的时间段进行定时同步

---

*最后更新：根据用户反馈优化触发条件，确保高效且安全的 Actions 使用*
