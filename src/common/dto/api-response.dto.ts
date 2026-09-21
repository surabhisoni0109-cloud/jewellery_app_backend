import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailDto {
  @ApiProperty({ example: 'INVALID_OTP', description: 'Business error code from specification' })
  code!: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({ example: 'Invalid OTP provided' })
  message!: string;

  @ApiProperty({ type: ErrorDetailDto })
  error!: ErrorDetailDto;
}

export class ApiSuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message!: string;

  data!: T;
}
