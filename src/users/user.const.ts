import argon2 from 'argon2'
export const hash_algorithms = ['argon2id', 'bcrypt', 'scrypt'] as const

// 推荐参数（示例，适度调整以匹配你服务器的 CPU/内存）
export const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 1 << 16, // 65536 KiB = 64 MiB
  timeCost: 3, // 迭代次数
  parallelism: 1,
} as const
