import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardCharts = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  const [reviewsData, setReviewsData] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandsError, setBrandsError] = useState('');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch Products
  useEffect(() => {
    if (!token) {
      setProductsError('User not logged in');
      setProductsLoading(false);
      return;
    }
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const res = await fetch('https://localhost:5050/products', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const productList = Array.isArray(data.products?.data) ? data.products.data : Array.isArray(data.data) ? data.data : [];
        setProducts(productList);
        setProductsLoading(false);
      } catch (err) {
        setProductsError(err.message || 'Failed to load products');
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  // Fetch Reviews (once products are loaded)
  useEffect(() => {
    if (products.length === 0) {
      setReviewsData([]);
      setReviewsLoading(false);
      return;
    }
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const reviewsPromises = products.map(async (product) => {
          try {
            const res = await fetch(`https://localhost:5050/products/${product.id}/reviews`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 204 || !res.ok)
              return { productId: product.id, productName: product.name, reviewCount: 0, averageRating: 0 };
            const reviews = await res.json();
            const count = reviews.length;
            const avgRating = count > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count : 0;
            return { productId: product.id, productName: product.name, reviewCount: count, averageRating: parseFloat(avgRating.toFixed(2)) };
          } catch {
            return { productId: product.id, productName: product.name, reviewCount: 0, averageRating: 0 };
          }
        });
        const reviewsResult = await Promise.all(reviewsPromises);
        setReviewsData(reviewsResult);
        setReviewsLoading(false);
      } catch (err) {
        setReviewsError(err.message || 'Failed to load reviews');
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [products, token]);

  // Fetch Categories
  useEffect(() => {
    if (!token) return;
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await fetch('https://localhost:5050/categories', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(Array.isArray(data.categories?.data) ? data.categories.data : []);
        setCategoriesLoading(false);
      } catch (err) {
        setCategoriesError(err.message || 'Failed to load categories');
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [token]);

  // Fetch Brands
  useEffect(() => {
    if (!token) return;
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        const res = await fetch('https://localhost:5050/brands', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to fetch brands');
        const data = await res.json();
        setBrands(Array.isArray(data.brands?.data) ? data.brands.data : []);
        setBrandsLoading(false);
      } catch (err) {
        setBrandsError(err.message || 'Failed to load brands');
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, [token]);

  // Fetch Orders
  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await fetch('https://localhost:5050/orders?page=1&pageSize=40', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        const ordersList = Array.isArray(data.orders?.data) ? data.orders.data : Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setOrders(ordersList);
        setOrdersLoading(false);
      } catch (err) {
        setOrdersError(err.message || 'Failed to load orders');
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Funksion për të grupuar porositë sipas ditës
  const groupOrdersByDay = (orders) => {
    const counts = {};
    orders.forEach((order) => {
      let dateStr = order.createdAt || order.CreatedAt;
      if (!dateStr) return;
      dateStr = dateStr.replace(' ', 'T');
      const date = new Date(dateStr);
      if (isNaN(date)) return;
      const day = date.toISOString().split('T')[0];
      counts[day] = (counts[day] || 0) + 1;
    });
    const sortedDays = Object.keys(counts).sort();
    return {
      labels: sortedDays,
      data: sortedDays.map((day) => counts[day]),
    };
  };

  const ordersByDay = groupOrdersByDay(orders);

  // Chart data & options as before...

  const chartDataOrders = {
    labels: ordersByDay.labels,
    datasets: [
      {
        label: 'Number of Orders per Day',
        data: ordersByDay.data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const optionsOrders = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Daily Orders' },
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Orders' },
      },
      x: {
        title: { display: true, text: 'Date' },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <section style={{ marginBottom: 30 }}>
        <h2>Daily Orders</h2>
        {ordersLoading && <p>Loading orders...</p>}
        {ordersError && <p style={{ color: 'red' }}>{ordersError}</p>}
        {!ordersLoading && !ordersError && orders.length === 0 && <p>No orders data found.</p>}
        {!ordersLoading && !ordersError && orders.length > 0 && (
          <div style={{ height: 300, maxWidth: 800 }}>
            <Bar data={chartDataOrders} options={optionsOrders} />
          </div>
        )}
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>Product Reviews</h2>
        {reviewsLoading && <p>Loading reviews...</p>}
        {reviewsError && <p style={{ color: 'red' }}>{reviewsError}</p>}
        {!reviewsLoading && !reviewsError && reviewsData.length === 0 && <p>No reviews data found.</p>}
        {!reviewsLoading && !reviewsError && reviewsData.length > 0 && (
          <div style={{ height: 300, width: '100%', maxWidth: 700 }}>
            <Bar
              data={{
                labels: reviewsData.map((r) => r.productName),
                datasets: [
                  {
                    label: 'Number of Reviews',
                    data: reviewsData.map((r) => r.reviewCount),
                    backgroundColor: 'rgba(75,192,192,0.6)',
                  },
                  {
                    label: 'Average Rating',
                    data: reviewsData.map((r) => r.averageRating),
                    backgroundColor: 'rgba(153,102,255,0.6)',
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  y: { beginAtZero: true, max: 5, title: { display: true, text: 'Count / Rating' } },
                  x: { title: { display: true, text: 'Products' } },
                },
                plugins: {
                  title: { display: true, text: 'Product Reviews Overview' },
                  legend: { position: 'top' },
                  tooltip: { enabled: true },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
        )}
      </section>

      <section
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 30,
        }}
      >
        <div
          style={{
            flex: '1 1 300px',
            minWidth: '250px',
            maxWidth: '350px',
            height: '350px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
          }}
        >
       
          {categoriesLoading && <p>Loading categories...</p>}
          {categoriesError && <p style={{ color: 'red' }}>{categoriesError}</p>}
          {!categoriesLoading && !categoriesError && categories.length === 0 && <p>No categories data found.</p>}
          {!categoriesLoading && !categoriesError && categories.length > 0 && (
            <Doughnut
              data={{
                labels: categories.map((cat) => cat.name),
                datasets: [
                  {
                    label: 'Categories',
                    data: categories.map((cat) => cat.productCount || 1),
                    backgroundColor: categories.map((_, i) =>
                      `hsl(${(i * 60) % 360}, 70%, 60%)`
                    ),
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'right' },
                  title: { display: true, text: 'Categories Overview' },
                },
                maintainAspectRatio: false,
              }}
            />
          )}
        </div>

        <div
          style={{
            flex: '1 1 300px',
            minWidth: '250px',
            maxWidth: '350px',
            height: '350px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
          }}
        >
      
          {brandsLoading && <p>Loading brands...</p>}
          {brandsError && <p style={{ color: 'red' }}>{brandsError}</p>}
          {!brandsLoading && !brandsError && brands.length === 0 && <p>No brands data found.</p>}
          {!brandsLoading && !brandsError && brands.length > 0 && (
            <Doughnut
              data={{
                labels: brands.map((b) => b.name),
                datasets: [
                  {
                    label: 'Brands',
                    data: brands.map((b) => b.productCount || 1),
                    backgroundColor: brands.map((_, i) =>
                      `hsl(${(i * 70) % 360}, 60%, 55%)`
                    ),
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'right' },
                  title: { display: true, text: 'Brands Overview' },
                },
                maintainAspectRatio: false,
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardCharts;
