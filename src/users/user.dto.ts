import {
  IsArray,
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator'
export class CreateUserDto {
  username: string
  password: string
  email: string
}

export class RegisterUserDto {
  @IsEmail()
  @MaxLength(100)
  email: string

  @IsString()
  @MinLength(6)
  @IsStrongPassword()
  password: string
}
export class LoginUserDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string
}

export class DeleteUserDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[]
}
