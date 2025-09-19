import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Logger as PinoLogger } from 'nestjs-pino'

import { AppModule } from './app.module'
import {
  AllExceptionsFilter,
  HttpRequestInterceptor,
  HttpResponseInterceptor,
} from './common'
import { PrismaService } from './common/prisma.service'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true,
  })

  // 使用 Pino 日志记录器
  const pinoLogger = app.get(PinoLogger)
  app.useLogger(pinoLogger)

  // 启用 Prisma shutdown hooks
  const prismaService = app.get(PrismaService)
  prismaService.enableShutdownHooks(app)

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter(pinoLogger))

  // 全局拦截器 - 按顺序执行
  app.useGlobalInterceptors(
    new HttpRequestInterceptor(pinoLogger),
    new HttpResponseInterceptor(pinoLogger),
  )

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  )

  const port = process.env.PORT ?? 4000
  const logger = new Logger('Bootstrap')
  await app.listen(port)

  logger.log(`🚀 Application is running on: http://localhost:${port}`)
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error)
  process.exit(1)
})
