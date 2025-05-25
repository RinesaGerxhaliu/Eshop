import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, ArcElement, Title, Tooltip, Legend);

const ChartComponent = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User is not logged in.');
          setLoading(false);
          return;
        }

        const response = await fetch('https://localhost:5050/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories.');
        }

        const data = await response.json();

        const catList = Array.isArray(data.categories)
          ? data.categories
          : Array.isArray(data)
          ? data
          : [];

        setCategories(catList);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Something went wrong');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const colors = [
    'rgba(75,192,192,0.6)',
    'rgba(255,99,132,0.6)',
    'rgba(153,102,255,0.6)',
    'rgba(255,159,64,0.6)',
    'rgba(54,162,235,0.6)',
    'rgba(255,206,86,0.6)',
    'rgba(201,203,207,0.6)',
  ];

  const chartData = {
    labels: categories.map((cat) => cat.name),
    datasets: [
      {
        label: 'Categories',
        data: new Array(categories.length).fill(1),
        backgroundColor: categories.map((_, i) => colors[i % colors.length]),
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Category Distribution',
      },
      tooltip: {
        enabled: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: 200, height: 200 }}>
      <h2>Category Distribution</h2>
      {loading && <p>Loading categories...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && categories.length === 0 && <p>No categories found.</p>}
      {!loading && !error && categories.length > 0 && (
        <Doughnut data={chartData} options={options} width={200} height={200} />
      )}
    </div>
  );
};

export default ChartComponent;
