import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/common/prisma.service'

@Injectable()
export class UserDao {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByUsername(username: string) {
    return this.prismaService.user.findUnique({
      where: { username },
    })
  }
}
