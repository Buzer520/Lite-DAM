#!/bin/bash

# Lite-DAM 部署脚本
# 服务器: Ubuntu 22.04
# 域名: mygdsp.cn
# IP: 8.146.232.81

set -e

echo "========================================="
echo "  Lite-DAM 部署脚本"
echo "  域名: mygdsp.cn"
echo "  服务器IP: 8.146.232.61"
echo "========================================="

# 1. 更新系统
echo ""
echo "[1/8] 更新系统软件..."
sudo apt update && sudo apt upgrade -y

# 2. 安装依赖
echo ""
echo "[2/8] 安装 Node.js、Nginx、Git..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx

# 3. 创建项目目录
echo ""
echo "[3/8] 创建项目目录..."
sudo mkdir -p /var/www/lite-dam
sudo chown $USER:$USER /var/www/lite-dam

# 4. 克隆项目
echo ""
echo "[4/8] 克隆项目代码..."
cd /var/www/lite-dam
git clone https://github.com/your-username/lite-dam.git .

# 5. 安装依赖并构建
echo ""
echo "[5/8] 安装依赖并构建..."

# 后端
echo "安装后端依赖..."
cd /var/www/lite-dam/backend
npm install --production
npm run build

# 前端
echo "安装前端依赖..."
cd /var/www/lite-dam/frontend
npm install --production
npm run build

# 6. 配置 Nginx
echo ""
echo "[6/8] 配置 Nginx..."
sudo cp /var/www/lite-dam/backend/nginx.conf /etc/nginx/sites-available/lite-dam
sudo ln -sf /etc/nginx/sites-available/lite-dam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. 获取 SSL 证书
echo ""
echo "[7/8] 获取 Let's Encrypt SSL 证书..."
sudo certbot --nginx -d mygdsp.cn -d www.mygdsp.cn --agree-tos --email your-email@example.com

# 8. 配置 PM2 进程管理
echo ""
echo "[8/8] 配置 PM2 进程管理..."
sudo npm install -g pm2

# 创建 PM2 配置
cat > /var/www/lite-dam/ecosystem.config.js << EOL
module.exports = {
  apps: [
    {
      name: 'lite-dam',
      script: 'dist/main.js',
      cwd: '/var/www/lite-dam/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
EOL

# 启动服务
cd /var/www/lite-dam/backend
pm2 start ecosystem.config.js

# 设置 PM2 开机自启
pm2 startup
pm2 save

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "访问地址:"
echo "  前端: https://mygdsp.cn"
echo "  API文档: https://mygdsp.cn/api/docs"
echo ""
echo "管理命令:"
echo "  pm2 status        # 查看服务状态"
echo "  pm2 logs          # 查看日志"
echo "  pm2 restart all   # 重启服务"
echo "  pm2 stop all      # 停止服务"