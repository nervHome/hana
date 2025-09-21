/**
 * 健康检查脚本
 * 用于 Docker 容器健康检查
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 4000,
  path: '/health',
  method: 'GET',
  timeout: 3000,
};

const healthCheck = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ 健康检查通过');
    process.exit(0);
  } else {
    console.error(`❌ 健康检查失败: HTTP ${res.statusCode}`);
    process.exit(1);
  }
});

healthCheck.on('error', (err) => {
  console.error('❌ 健康检查连接失败:', err.message);
  process.exit(1);
});

healthCheck.on('timeout', () => {
  console.error('❌ 健康检查超时');
  healthCheck.destroy();
  process.exit(1);
});

healthCheck.end();
