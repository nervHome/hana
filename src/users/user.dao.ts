import { Injectable } from '@nestjs/common'
import argon2 from 'argon2'
import { User, UserRole } from 'generated/prisma'
import { PrismaService } from '@/common/prisma.service'
import { ARGON2_OPTIONS, hash_algorithms } from './user.const'

@Injectable()
export class UserDao {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email: email },
    })
  }

  async createUser(
    email: string,
    password: string,
    hashAlgo: string = hash_algorithms[0],
  ) {
    // 2) 哈希（argon2 会内部生成随机 salt）
    const hash = await argon2.hash(password, ARGON2_OPTIONS)
    return this.prismaService.user.create({
      data: {
        email,
        password_hash: hash,
        role: UserRole.ADMIN,
        hash_meta: {
          memoryCost: ARGON2_OPTIONS.memoryCost,
          timeCost: ARGON2_OPTIONS.timeCost,
          parallelism: ARGON2_OPTIONS.parallelism,
        },
        hash_algo: hashAlgo,
      },
    })
  }

  async verifyPasswordAndMaybeRehash(
    user: Pick<User, 'password_hash' | 'id'>,
    candidatePassword: string,
  ) {
    const storedHash = user.password_hash

    // 1) 验证
    const ok = await argon2.verify(storedHash, candidatePassword)
    if (!ok) return false

    // 2) 可选：如果你改变了参数，检测是否需要 rehash
    const needRehash = argon2.needsRehash
      ? argon2.needsRehash(storedHash, ARGON2_OPTIONS)
      : false

    if (needRehash) {
      const newHash = await argon2.hash(candidatePassword, ARGON2_OPTIONS)
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { password_hash: newHash, hash_meta: ARGON2_OPTIONS },
      })
    }
    return true
  }
  deleteBatch(ids: string[] = []) {
    return this.prismaService.user.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
  }
}
