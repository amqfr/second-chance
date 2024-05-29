import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: number): Promise<any> {
    return this.usersService.getUser(userId);
  }

  @Get(':userId/avatar')
  async getUserAvatar(@Param('userId') userId: string): Promise<string> {
    return this.usersService.getUserAvatar(userId);
  }

  @Delete(':userId/avatar')
  async deleteUserAvatar(@Param('userId') userId: number): Promise<void> {
    return this.usersService.deleteUserAvatar(userId);
  }
}
