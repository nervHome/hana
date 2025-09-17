import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CommonModule } from './common/common.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    // 全局配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // 全局公共模块
    CommonModule,
    // 日志模块
    LoggerModule.forRootAsync({
      useFactory: () => {
        const isDevelopment = process.env.NODE_ENV !== 'production'
        if (isDevelopment) {
          // 开发环境：彩色控制台输出
          return {
            pinoHttp: {
              level: process.env.LOG_LEVEL || 'debug',
              autoLogging: false,
              transport: {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'yyyy-mm-dd HH:MM:ss',
                  ignore: 'pid,hostname',
                  singleLine: true,
                },
              },
            },
          }
        }
        // 生产环境：文件日志
        return {
          pinoHttp: {
            level: process.env.LOG_LEVEL || 'info',
            serializers: {
              req: (req) => ({
                method: req.method,
                url: req.url,
                userAgent: req.headers['user-agent'],
              }),
              res: (res) => ({
                statusCode: res.statusCode,
              }),
            },
            autoLogging: {
              ignore: (req) => {
                // 忽略健康检查等路由
                return req.url === '/health' || req.url === '/metrics'
              },
            },
            transport: {
              targets: [
                {
                  target: 'pino/file',
                  options: { destination: './logs/app.log' },
                  level: 'info',
                },
                {
                  target: 'pino/file',
                  options: { destination: './logs/error.log' },
                  level: 'error',
                },
              ],
            },
          },
        }
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
