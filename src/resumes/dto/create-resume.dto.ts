import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'userId is required' })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'url is required' })
  url: string;

  @IsNotEmpty({ message: 'status is required' })
  status: string;

  @IsNotEmpty({ message: 'companyId is required' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'jobId is required' })
  jobId: mongoose.Schema.Types.ObjectId;

  histories: {
    status: string;
    updatedAt: Date;
    updatedBy: {
      _id: mongoose.Schema.Types.ObjectId;
      email: string;
    };
  }[];
}

export class CreateUserCvDto {
  @IsNotEmpty({ message: 'url is required' })
  url: string;

  @IsNotEmpty({ message: 'companyId is required' })
  @IsMongoId({ message: 'companyId must be a valid MongoDB ObjectId' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'jobId is required' })
  @IsMongoId({ message: 'jobId must be a valid MongoDB ObjectId' })
  jobId: mongoose.Schema.Types.ObjectId;
}
