/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
export interface InstagramAccount {
  id: string;
  instagramId: string;
  facebookPageId: string | null;
  username: string;
  status: 'active' | 'disconnected' | 'error';
  tokenType: 'long_lived' | 'system_user' | 'short_lived';
  tokenExpiry: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstagramAccountsResponse {
  data?: InstagramAccount[];
}

export interface InstagramMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  content: string;
  type: string;
  status: string;
  externalMessageId: string | null;
  createdAt: string;
}

export interface ConnectAccountDto {
  accessToken: string;
}

export interface SendMessageDto {
  accountId: string;
  to: string;
  message: string;
}

export interface InstagramConversation {
  instagramId: string; // recipient's IGSID / PSID — pass this to send message
  username: string | null;
  profilePic: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastDirection: 'inbound' | 'outbound' | null;
  unreadCount: number;
}
