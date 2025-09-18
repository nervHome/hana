import { Injectable } from '@nestjs/common'
import { User } from 'generated/prisma'
import { Logger } from 'nestjs-pino'
import { UserDao } from './user.dao'

@Injectable()
export class UsersService {
  constructor(
    private readonly userDAO: UserDao,
    private readonly logger: Logger,
  ) {}

  /**
   *  Find user by username
   * @param email
   * @returns
   */
  async findUserByEmail(email: string) {
    return this.userDAO.findUserByEmail(email)
  }

  async createUser(email: string, password: string) {
    return this.userDAO.createUser(email, password)
  }

  async validateUser(
    email: string,
    candidatePassword: string,
  ): Promise<Omit<User, 'password_hash'> | null> {
    this.logger.log('begin validate user ', UsersService.name)
    const user = await this.userDAO.findUserByEmail(email)
    if (user) {
      const valid = await this.userDAO.verifyPasswordAndMaybeRehash(
        user,
        candidatePassword,
      )
      if (valid) {
        const { password_hash: _password_hash, ...result } = user
        this.logger.log('validate successfully')
        return result
      } else {
        this.logger.warn('validate failed')
      }
    } else {
      this.logger.warn('user is not found', UsersService.name)
    }
    return null
  }

  deleteBatch(ids: string[]) {
    this.logger.log(`delete users: ${ids}`, UsersService.name)
    return this.userDAO.deleteBatch(ids)
  }

  currentUser(userId: string) {
    this.logger.log(`current user id: ${userId}`, UsersService.name)
    return this.userDAO.getUserById(userId)
  }
}
