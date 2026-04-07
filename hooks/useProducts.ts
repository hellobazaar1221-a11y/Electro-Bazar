import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Category, Slider } from '@/types';

export function useProducts(categoryId?: string, search?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [categoryId, search]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('products')
        .select('*, category:categories(*)')
        .gt('stock', 0);

      if (categoryId) query = query.eq('category_id', categoryId);
      if (search) query = query.ilike('name', `%${search}%`);

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setProducts((data || []).map((p: any) => ({
        ...p,
        images: p.images || [],
      })));
    } catch (e: any) {
      setError(e.message);
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setProduct(data ? { ...data, images: data.images || [] } : null);
        setLoading(false);
      });
  }, [id]);

  return { product, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      setCategories(data || getMockCategories());
      setLoading(false);
    }).catch(() => {
      setCategories(getMockCategories());
      setLoading(false);
    });
  }, []);

  return { categories, loading };
}

export function useSliders() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('sliders').select('*').eq('active', true).then(({ data }) => {
      setSliders(data || getMockSliders());
      setLoading(false);
    }).catch(() => {
      setSliders(getMockSliders());
      setLoading(false);
    });
  }, []);

  return { sliders, loading };
}

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);
  return { orders, loading, refetch: fetchOrders };
}

function getMockProducts(): Product[] {
  return [
    {
      id: '1', name: 'Samsung Galaxy S24', description: 'Latest flagship phone', price: 79999,
      discount: 10, images: [], category_id: '1', stock: 50, rating: 4.5, reviews_count: 1200,
    },
    {
      id: '2', name: 'Sony WH-1000XM5', description: 'Premium noise cancelling headphones', price: 29999,
      discount: 15, images: [], category_id: '2', stock: 30, rating: 4.8, reviews_count: 890,
    },
    {
      id: '3', name: 'Apple iPad Air', description: '10.9-inch Liquid Retina display', price: 59999,
      discount: 5, images: [], category_id: '3', stock: 25, rating: 4.7, reviews_count: 654,
    },
    {
      id: '4', name: 'OnePlus 12', description: 'Fast and powerful flagship', price: 64999,
      discount: 8, images: [], category_id: '1', stock: 40, rating: 4.4, reviews_count: 445,
    },
    {
      id: '5', name: 'Boat Airdopes 141', description: 'TWS earbuds with 42hr playback', price: 1499,
      discount: 50, images: [], category_id: '2', stock: 200, rating: 4.2, reviews_count: 5600,
    },
    {
      id: '6', name: 'Lenovo IdeaPad Slim 5', description: '15.6" FHD laptop AMD Ryzen 5', price: 52999,
      discount: 12, images: [], category_id: '4', stock: 15, rating: 4.3, reviews_count: 320,
    },
  ];
}

function getMockCategories(): Category[] {
  return [
    { id: '1', name: 'Mobiles', icon: 'smartphone' },
    { id: '2', name: 'Audio', icon: 'headphones' },
    { id: '3', name: 'Tablets', icon: 'tablet' },
    { id: '4', name: 'Laptops', icon: 'laptop' },
    { id: '5', name: 'Cameras', icon: 'camera' },
    { id: '6', name: 'TVs', icon: 'tv' },
    { id: '7', name: 'Wearables', icon: 'watch' },
    { id: '8', name: 'Gaming', icon: 'gamepad-2' },
  ];
}

function getMockSliders(): Slider[] {
  return [
    { id: '1', image: '', title: 'Mega Sale - Up to 70% Off', active: true },
    { id: '2', image: '', title: 'New Arrivals - Top Brands', active: true },
    { id: '3', image: '', title: 'EMI at 0% Interest', active: true },
  ];
}
