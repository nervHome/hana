import { Module } from '@nestjs/common'
import { CommonModule } from '@/common/common.module'
import { UserDao } from './user.dao'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [CommonModule],
  providers: [UsersService, UserDao],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
