import { Injectable, Logger } from '@nestjs/common'

/**
 * JWT 黑名单服务
 * 用于管理已注销的JWT令牌
 */
@Injectable()
export class JwtBlacklistService {
  private blacklistedTokens = new Set<string>()
  private readonly logger = new Logger(JwtBlacklistService.name)

  constructor() {}

  /**
   * 将JWT令牌添加到黑名单
   */
  addToBlacklist(token: string, expiresAt?: Date): void {
    this.blacklistedTokens.add(token)

    // 如果提供了过期时间，设置定时器自动清理
    if (expiresAt) {
      const timeUntilExpiry = expiresAt.getTime() - Date.now()
      if (timeUntilExpiry > 0) {
        setTimeout(() => {
          this.blacklistedTokens.delete(token)
          this.logger.log(
            { token: token.substring(0, 20) + '...' },
            'Token automatically removed from blacklist after expiry',
          )
        }, timeUntilExpiry)
      }
    }
  }

  /**
   * 检查JWT令牌是否在黑名单中
   */
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token)
  }

  /**
   * 从黑名单中移除JWT令牌（通常不需要手动调用）
   */
  removeFromBlacklist(token: string): void {
    const removed = this.blacklistedTokens.delete(token)
    if (removed) {
    }
  }

  /**
   * 获取黑名单大小（用于监控）
   */
  getBlacklistSize(): number {
    return this.blacklistedTokens.size
  }

  /**
   * 清理黑名单
   */
  cleanup(): void {
    const _sizeBefore = this.blacklistedTokens.size
    // 这里可以实现更复杂的清理逻辑
    this.blacklistedTokens.clear()
    this.logger.log(
      `Blacklist cleanup completed. Removed ${_sizeBefore} tokens`,
    )
  }
}
