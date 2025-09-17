import { Injectable } from '@nestjs/common'
import { UserDao } from './user.dao'

@Injectable()
export class UsersService {
  constructor(private readonly userDAO: UserDao) {}

  /**
   *  Find user by username
   * @param username
   * @returns
   */
  async findUserByUsername(username: string) {
    return this.userDAO.findUserByUsername(username)
  }
}
