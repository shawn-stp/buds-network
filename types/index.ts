
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

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture: string;
  content: string;
  images: string[];
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
  userId: string;
  name: string;
  description: string;
  price: number;
  type: string;
  images: string[];
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
