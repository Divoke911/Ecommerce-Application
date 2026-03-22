import React from 'react';
import { Link } from 'react-router-dom';

const categoryIcons = {
  'Electronics': '📱',
  'Fashion': '👗',
  'Home and Kitchen': '🏠',
  'Books': '📚',
  'Sports and Fitness': '🏋️',
  'Mobiles': '📱',
  'Laptops': '💻',
  'Earbuds and Headphones': '🎧',
  'Cameras': '📷',
  'Men Clothing': '👔',
  'Women Clothing': '👗',
  'Kitchen Appliances': '🍳',
  'Home Decor': '🖼️',
  'Fiction': '📖',
  'Gym Equipment': '🏋️',
};

const CategoryCard = ({ category }) => {
  const icon = categoryIcons[category.name] || '🛍️';

  return (
    <Link to={`/products?category=${category.id}`}>
      <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer group">
        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <p className="text-xs font-medium text-gray-700 line-clamp-2">
          {category.name}
        </p>
      </div>
    </Link>
  );
};

export default CategoryCard;