export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar_url?: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  images: string[];
  category_id?: string;
  category?: Category;
  stock: number;
  rating?: number;
  reviews_count?: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  user_id: string;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
  user_id: string;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  address: Address;
  payment_method: 'cod' | 'stripe' | 'upi';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  expiry?: string;
  min_amount?: number;
}

export interface Slider {
  id: string;
  image: string;
  product_id?: string;
  title?: string;
  active: boolean;
}
