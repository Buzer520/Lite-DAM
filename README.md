# Lite-DAM 素材资产管理系统

轻量级、低成本、高效率的素材管理后台

## 技术栈

- **前端**: Vue 3 + Element Plus + Pinia + Vue Router
- **后端**: NestJS + TypeORM
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **认证**: JWT

## 快速开始

### 后端

```bash
cd backend
npm install
npm run start:dev
```

后端服务运行在 http://localhost:3000

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端服务运行在 http://localhost:5173

## 默认账户

系统启动时自动创建超级管理员账户：

- **用户名**: admin
- **密码**: admin123
- **角色**: 超级管理员

## 功能特性

### 账号与权限
- 自助注册系统，注册后默认为普通用户
- 超级管理员可将普通用户提升为管理员
- 支持账号封禁/解封、密码重置
- 个人中心维护头像、昵称、存储配额查看

### 素材管理
- 多格式批量上传（图片、视频、PDF、文档等）
- 差异化视图：
  - 普通用户：仅能看到自己上传的素材
  - 管理员/超管：可切换至全量视图，查看全站素材
- 在线预览（图片点击放大、视频在线播放）
- 单选或批量下载
- 元数据编辑（名称、分类、标签）
- 检索系统（文件名模糊搜索、按上传人/日期/类型过滤）

### 个性化设置
- 动态主题换色（预设或自定义色值）
- 暗黑模式切换

### 审计与安全
- 操作审计日志（记录关键行为）
- 管理员删除他人素材需二次确认
- 存储统计

## 项目结构

```
Lite-DAM/
├── backend/                 # 后端 NestJS 项目
│   ├── src/
│   │   ├── auth/           # 认证模块 (JWT、守卫)
│   │   ├── users/          # 用户模块
│   │   ├── assets/         # 素材模块
│   │   ├── audit/          # 审计日志模块
│   │   └── common/         # 公共模块 (中间件、种子数据)
│   └── uploads/            # 上传文件存储目录
├── frontend/               # 前端 Vue 3 项目
│   └── src/
│       ├── views/          # 页面组件
│       ├── stores/         # Pinia 状态管理
│       ├── utils/          # 工具函数
│       └── styles/         # 样式文件
└── README.md
```

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户接口
- `GET /api/users` - 获取用户列表 (管理员)
- `GET /api/users/profile` - 获取个人信息
- `PUT /api/users/profile` - 更新个人信息
- `PUT /api/users/:id/role` - 修改用户角色 (超管)
- `PUT /api/users/:id/toggle-active` - 封禁/解封用户 (超管)
- `POST /api/users/:id/reset-password` - 重置密码 (超管)

### 素材接口
- `POST /api/assets/upload` - 上传素材
- `GET /api/assets` - 获取素材列表
- `GET /api/assets/:id` - 获取素材详情
- `GET /api/assets/:id/file` - 预览素材文件
- `GET /api/assets/:id/download` - 下载素材文件
- `PUT /api/assets/:id` - 更新素材信息
- `DELETE /api/assets/:id` - 删除素材
- `GET /api/assets/stats` - 获取存储统计 (管理员)

### 审计接口
- `GET /api/audit` - 获取审计日志 (管理员/超管)

## 角色权限说明

| 角色 | 权限描述 |
|------|----------|
| 普通用户 (user) | 管理个人素材（上传、下载、修改、删除） |
| 管理员 (admin) | 全局视角：管理全站素材、查看用户列表 |
| 超级管理员 (super_admin) | 上帝视角：分配管理员、封禁账号、查看审计日志 |

## 验收标准验证

- [x] 普通用户注册后，无法通过任何方式查看他人素材
- [x] 超级管理员将用户设为管理员后，该用户刷新页面能立刻看到全站素材管理菜单
- [x] 更改主题颜色后，系统全局主色调实时生效，且刷新页面后配置不丢失
- [x] 管理员删除任意素材后，系统审计日志中产生对应记录
- [x] 界面设计简洁，交互体验良好
