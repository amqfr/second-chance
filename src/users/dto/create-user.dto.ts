import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: 'id' })
  id: number;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({message: 'Email is required'})
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  @Length(1, 70, { message: 'First name must be between 1 and 70 characters' })
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  @Length(1, 100, { message: 'Last name must be between 1 and 100 characters' })
  last_name: string;

  @IsString()
  avatar: string;
}
