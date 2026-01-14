export interface Market {
  id: string;
  title: string;
  category: string;
  volume: string;
  imageUrl: string;
  probYes: number;
  probNo: number;
  endDate?: string;
  liquidity?: string;
  description?: string;
  isLive?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingUrls?: Array<{uri: string, title: string}>;
}

export interface UserProfile {
  name: string;
  email: string;
  balance: number;
  avatarUrl: string;
  level: 'Novato' | 'Experto' | 'Maestro';
}