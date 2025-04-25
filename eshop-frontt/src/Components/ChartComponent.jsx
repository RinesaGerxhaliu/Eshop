import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2'; // Import Doughnut chart
import { Chart as ChartJS, CategoryScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register required chart components
ChartJS.register(
  CategoryScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
          return;
        }

        const response = await fetch('https://localhost:5050/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories.');
        }

        const data = await response.json();
        setCategories(data.categories); // Assuming the data contains category names
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Prepare chart data for Doughnut chart
  const chartData = {
    labels: categories.map((category) => category.name), // Using category names as labels
    datasets: [
      {
        label: 'Categories',
        data: new Array(categories.length).fill(1), // Example data for each category (1 for each category)
        backgroundColor: [
          'rgba(75,192,192,0.6)',
          'rgba(255,99,132,0.6)',
          'rgba(153,102,255,0.6)',
          'rgba(255,159,64,0.6)',
          'rgba(54,162,235,0.6)',
        ], // Different colors for each segment
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
    <div style={{ width: '200px', height: '200px' }}>
      <h2>Category Distribution</h2>

      {loading ? (
        <p>Loading categories...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <Doughnut data={chartData} options={options} width={200} height={200} />
      )}
    </div>
  );
};

export default ChartComponent;
