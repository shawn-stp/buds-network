
export interface User {
  id: string;
  companyName: string;
  bio: string;
  profilePicture: string;
  productsPageLink: string;
  followers: string[];
  following: string[];
  buds: string[];
  posts: string[];
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

export interface LinkOverlay {
  id: string;
  url: string;
  label: string;
  x: number;
  y: number;
}

export interface ImageOverlays {
  texts: TextOverlay[];
  stickers: StickerOverlay[];
  links: LinkOverlay[];
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture: string;
  content: string;
  images: string[];
  imageOverlays?: ImageOverlays[];
  music?: {
    uri: string;
    name: string;
  };
  timestamp: Date;
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string;
  product_type: string;
  images: string[];
  price: number;
  created_at: string;
}

export type ProductFilter = {
  priceRange: {
    min: number;
    max: number;
  };
  types: string[];
};

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}
