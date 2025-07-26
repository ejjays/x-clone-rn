export type ReactionName =
  | "like"
  | "love"
  | "celebrate"
  | "wow"
  | "haha"
  | "sad"
  | "angry";

// mobile/types/index.ts
export interface User {
  _id: string;
  clerkId: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email?: string;
  bio?: string;
  location?: string;
  bannerImage?: string;
  followers?: string[];
  following?: string[];
  createdAt?: string;
}

export interface Reaction {
  _id: string;
  user: User;
  type: ReactionName;
}

export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  user: User;
  likes: string[];
}

export interface Post {
  _id: string;
  content: string;
  image?: string;
  video?: string;
  createdAt: string;
  user: User;
  reactions: Reaction[];
  comments: Comment[];
}

export interface Notification {
  _id: string;
  from: User;
  to: string;
  type: "like" | "comment" | "follow";
  post?: {
    _id: string;
    content: string;
    image?: string;
  };
  comment?: {
    _id: string;
    content: string;
  };
  createdAt: string;
}
export type ReactionName =
  | "like"
  | "love"
  | "celebrate"
  | "wow"
  | "haha"
  | "sad"
  | "angry";

// mobile/types/index.ts
export interface User {
  _id: string;
  clerkId: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email?: string;
  bio?: string;
  location?: string;
  bannerImage?: string;
  followers?: string[];
  following?: string[];
  createdAt?: string;
}

export interface Reaction {
  _id: string;
  user: User;
  type: ReactionName;
}

export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  user: User;
  likes: string[];
}

export interface Post {
  _id: string;
  content: string;
  image?: string;
  video?: string;
  createdAt: string;
  user: User;
  reactions: Reaction[];
  comments: Comment[];
}

export interface Notification {
  _id: string;
  from: User;
  to: string;
  type: "like" | "comment" | "follow";
  post?: {
    _id: string;
    content: string;
    image?: string;
  };
  comment?: {
    _id: string;
    content: string;
  };
  createdAt: string;
}
