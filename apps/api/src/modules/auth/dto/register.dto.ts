import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '邮箱地址', example: 'user@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ description: '密码', minLength: 6 })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;

  @ApiProperty({ description: '用户名' })
  @IsString()
  @MinLength(2, { message: '用户名至少2个字符' })
  @MaxLength(50)
  name: string;
}
