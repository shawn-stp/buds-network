
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
