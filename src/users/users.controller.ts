import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from './../auth/guard/jwt-auth.guard'
import { DeleteUserDto, RegisterUserDto } from './user.dto'
import { UsersService } from './users.service'

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createUserDto: RegisterUserDto) {
    return this.usersService.createUser(
      createUserDto.email,
      createUserDto.password,
    )
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  delete(@Body() deleteUserDto: DeleteUserDto) {
    return this.usersService.deleteBatch(deleteUserDto.ids)
  }

  @Get('currentUser')
  @UseGuards(JwtAuthGuard)
  currentInfo(@Req() req: { user: { userId: string } }) {
    return this.usersService.currentUser(req.user.userId)
  }
}
