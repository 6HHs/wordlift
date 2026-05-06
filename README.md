<div align="center">
  <h1>📖 WordLift</h1>
  <p><strong>高效背词 · 真题实战 · 科学复习</strong></p>
  <p>面向 CET-4 / CET-6 考生的全栈词汇学习平台</p>
  <br>
</div>

## 功能

| 模块 | 说明 |
|------|------|
| **词库管理** | 内置 CET-4 / CET-6 / 考研 / 雅思等多本词书 |
| **卡片学习** | 翻转卡片模式，支持英文/中文/双语三种展示 |
| **拼写模式** | 看中文拼英文，强化输出能力 |
| **间隔复习** | 基于 SM-2 算法的自适应复习，自动安排复习计划 |
| **自动发音** | 翻页自动朗读，支持 Youdao TTS + 浏览器语音合成双引擎 |
| **真题阅读** | 历年 CET-4/6 真题 PDF 在线阅读，支持提取文字 + 点击查词 |
| **学习统计** | ECharts 可视化：掌握分布、遗忘曲线、打卡热力图 |
| **每日打卡** | 连续学习天数记录，激励养成习惯 |
| **生词本** | 自定义添加生词，补充学习 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 (Composition API) + TypeScript + Vite + Pinia + Vue Router |
| 后端 | NestJS + Prisma ORM + MySQL |
| 图表 | ECharts + vue-echarts |
| 部署 | PM2 + Nginx |

## 快速开始

### 前置要求

- Node.js >= 20
- MySQL >= 8.0
- pnpm / npm / yarn

### 1. 克隆项目

```bash
git clone https://github.com/<your-username>/wordlift.git
cd wordlift
```

### 2. 数据库初始化

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE wordlift DEFAULT CHARACTER SET utf8mb4"

# 初始化表结构
cd backend
# 编辑 .env 中的 DATABASE_URL，填写数据库连接信息
npx prisma migrate dev --name init

# 导入词库数据（运行 seed 脚本）
npm run prisma:seed
```

### 3. 启动后端

```bash
cd backend
npm install
npm run build
npm start
```

后端默认运行在 `http://localhost:3000`。

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器默认运行在 `http://localhost:5173`。

### 5. 访问

打开浏览器访问 `http://localhost:5173` 即可使用。

## 项目结构

```
wordlift/
├── frontend/                # Vue 3 前端
│   ├── src/
│   │   ├── api/            # API 请求层 (axios)
│   │   ├── components/     # 公共组件 (FlashCard 等)
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── types/          # TypeScript 类型定义
│   │   ├── views/          # 页面视图
│   │   └── router/         # 路由配置
│   └── dist/               # 构建产物
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── modules/
│   │   │   ├── word-books/ # 词书模块
│   │   │   ├── words/      # 单词模块
│   │   │   ├── review/     # 复习模块 (SM-2)
│   │   │   ├── statistics/ # 统计模块
│   │   │   ├── exams/      # 真题模块
│   │   │   └── custom-words/ # 自定义生词模块
│   │   └── prisma/         # Prisma schema & 迁移
│   └── exam-papers/        # 真题试卷 PDF 文件
└── README.md
```

## 配置

### 前端

编辑 `frontend/.env.production`：

```
VITE_API_URL=/api
```

### 后端

编辑 `backend/.env`：

```
DATABASE_URL="mysql://user:password@localhost:3306/wordlift"
PORT=3000
NODE_ENV=development
```

## 部署

项目使用 Nginx 托管前端静态资源 + 反向代理后端 API：

```nginx
# Nginx 配置参考
root /opt/frontend/dist;
location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
}
```

PM2 管理后端进程：

```bash
pm2 start dist/main.js --name wordlift-backend
```

## 许可

[MIT](LICENSE)
