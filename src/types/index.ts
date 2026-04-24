export interface Comment {
  _id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Article {
  _id: string;
  shortId: string;
  publicId: string;
  title: string;
  image: string;
  date: string;
  content: string;
  createdAt: string;
  trending: boolean;
  likes: number;
  views: number;
  category: string;
  comments: Comment[];
  updatedAt?: string;
}

export interface Staff {
  _id?: string;
  staffId: string;
  name: string;
  role: string;
  phone: string;
  photo: string;
  createdAt: string;
}


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
