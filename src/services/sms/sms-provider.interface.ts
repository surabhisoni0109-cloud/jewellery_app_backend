export interface ISmsProvider {
  sendOtp(mobileNumber: string, otp: string): Promise<void>;
}

export const SMS_PROVIDER_TOKEN = 'SMS_PROVIDER_TOKEN';
