import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { PrismaClient } from 'generated/prisma'
import { Logger } from 'nestjs-pino'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: Logger) {
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'colorless',
    })
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect()
      this.logger.log('Database connected successfully', PrismaService.name)
    } catch (error) {
      this.logger.error(
        'Failed to connect to database',
        error,
        PrismaService.name,
      )
      throw error
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect()
      this.logger.log('Database disconnected successfully', PrismaService.name)
    } catch (error) {
      this.logger.error(
        'Failed to disconnect from database',
        error,
        PrismaService.name,
      )
    }
  }

  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', async () => {
      await app.close()
    })
  }
}
