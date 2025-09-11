import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateResumeDto {
  @IsNotEmpty({ message: 'Status should not be empty' })
  @IsString({ message: 'Status must be a string' })
  status: string;
}
