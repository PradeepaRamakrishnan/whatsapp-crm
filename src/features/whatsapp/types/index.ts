// src/features/whatsapp/types/index.ts

export interface PhoneNumber {
  id: string;
  displayPhoneNumber: string;
  verifiedName: string;
  codeVerificationStatus: 'VERIFIED' | 'NOT_VERIFIED';
}

export interface WhatsappAccount {
  id: string;
  wabaId: string;
  wabaName: string;
  phoneNumber: string;
  phoneNumberId: string;
  status: 'connected' | 'active' | 'disconnected' | 'error' | 'pending_otp';
  tokenType: 'short_lived' | 'long_lived' | 'system_user';
  tokenExpiry?: string;
  isVerified: boolean;
  createdAt: string;
}

export type ConnectStep = 'idle' | 'connecting' | 'select_phone' | 'registering' | 'done' | 'error';
