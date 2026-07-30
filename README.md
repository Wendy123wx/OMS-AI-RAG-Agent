# OMS-AI-RAG-Agent
基于LangGraph的OMS业务RAG智能Agent系统
# 项目结构
oms-ai-rag-agent/
├── backend/                # Node TS AI后端服务
│   ├── src/
│   │   ├── config/         # 环境、LLM配置
│   │   ├── upload/         # multer上传配置
│   │   ├── loader/         # 多格式文档解析
│   │   ├── rag/            # 向量库、文本切片
│   │   ├── tools/          # OMS订单查询自定义工具
│   │   ├── graph/          # LangGraph核心
│   │   │   ├── state.ts    # Annotation标准状态定义
│   │   │   ├── nodes/      # 4个节点函数
│   │   │   └── omsGraph.ts # 组装Graph
│   │   ├── controller/
│   │   ├── routes/
│   │   └── index.ts        # 服务入口
│   ├── .env.example        # 环境变量模板（上传GitHub）
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
├── frontend-vue3/          # Vue3前端（可选react文件夹）
│   ├── src/
│   │   ├── api/            # 请求封装
│   │   ├── stores/         # Pinia对话状态
│   │   ├── components/    # 上传、聊天组件
│   │   ├── views/          # 页面
│   │   └── App.vue
│   ├── vite.config.ts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # 一键编排前后端
├── .gitignore              # 忽略node_modules、向量库、env、缓存
└── README.md               # GitHub标准文档：启动、部署、功能介绍

# GitHub标准文档
# 启动
# 部署
# 功能介绍
