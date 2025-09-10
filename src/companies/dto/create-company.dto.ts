import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name is too long (max: 100 chars)' })
  name: string;

  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a string' })
  @MaxLength(200, { message: 'Address is too long (max: 200 chars)' })
  address: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description is too long (max: 2000 chars)' })
  description: String;

  @IsNotEmpty({ message: 'Logo is required' })
  @IsString({ message: 'Logo must be a string' })
  logo: String;
}
