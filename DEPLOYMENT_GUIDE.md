# Lite-DAM 部署指南

## 服务器信息
- **服务器**: 阿里云 Ubuntu 24.04
- **IP地址**: 47.97.164.238
- **域名**: mygdsp.cn
- **DNS记录**: 已配置 dns23.hichina.com

## 部署步骤

### 1. 登录服务器

```bash
ssh root@47.97.164.238
```

### 2. 上传项目文件

将项目上传到服务器：

```bash
# 使用 scp 上传
scp -r /path/to/local/Lite-DAM root@47.97.164.238:/var/www/

# 或者使用 git 克隆（推荐）
git clone https://github.com/your-username/lite-dam.git /var/www/lite-dam
```

### 3. 执行部署脚本

```bash
cd /var/www/lite-dam
chmod +x deploy.sh
./deploy.sh
```

### 4. 手动部署步骤（如果脚本执行失败）

#### 4.1 更新系统和安装依赖

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx
```

#### 4.2 安装项目依赖

```bash
# 后端
cd /var/www/lite-dam/backend
npm install --production
npm run build

# 前端
cd /var/www/lite-dam/frontend
npm install --production
npm run build
```

#### 4.3 配置 Nginx

```bash
sudo cp /var/www/lite-dam/backend/nginx.conf /etc/nginx/sites-available/lite-dam
sudo ln -sf /etc/nginx/sites-available/lite-dam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4.4 获取 SSL 证书

```bash
sudo certbot --nginx -d mygdsp.cn -d www.mygdsp.cn --agree-tos --email your-email@example.com
```

#### 4.5 配置 PM2

```bash
sudo npm install -g pm2
cd /var/www/lite-dam/backend
pm2 start dist/main.js --name lite-dam --env production
pm2 startup
pm2 save
```

## 服务管理

### 查看服务状态

```bash
pm2 status
```

### 查看日志

```bash
pm2 logs lite-dam
```

### 重启服务

```bash
pm2 restart lite-dam
```

### 停止服务

```bash
pm2 stop lite-dam
```

## 配置文件说明

### 后端环境配置

文件: `/var/www/lite-dam/backend/.env.prod`

```bash
# 数据库配置
DB_TYPE=sqlite
DB_PATH=./lite-dam.db

# JWT 密钥（生产环境必须修改）
JWT_SECRET=your-strong-secret-key

# 服务器端口
PORT=3000

# CORS 域名
CORS_ORIGIN=https://mygdsp.cn
```

### Nginx 配置

文件: `/etc/nginx/sites-available/lite-dam`

## 访问地址

- **前端**: https://mygdsp.cn
- **API文档**: https://mygdsp.cn/api/docs

## 故障排除

### 服务无法启动

```bash
# 检查端口是否被占用
netstat -tlnp | grep 3000

# 检查 PM2 日志
pm2 logs lite-dam
```

### Nginx 配置错误

```bash
# 检查配置语法
sudo nginx -t

# 查看 Nginx 日志
tail -f /var/log/nginx/error.log
```

### SSL 证书问题

```bash
# 检查证书状态
sudo certbot certificates

# 重新获取证书
sudo certbot renew --dry-run
```

## 安全建议

1. **修改默认密码**：部署后立即修改管理员密码
2. **防火墙配置**：只开放必要端口（80, 443）
3. **定期更新**：定期更新系统和依赖包
4. **备份数据**：定期备份数据库和上传文件
5. **强密码策略**：使用复杂密码