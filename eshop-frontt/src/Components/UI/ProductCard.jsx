import { Link } from 'react-router-dom';
import '../../Styles/Homepage.css';
import { useCurrency } from '../../contexts/CurrencyContext';

const ProductCard = ({ id, name, description, price, imageUrl, reviews }) => {
  const { convert, format } = useCurrency();

  const displayPrice = format(convert(price));

  const src = imageUrl
    ? `https://localhost:5050${imageUrl}`
    : '/Assets/placeholder.png';

  return (
    <div className="product-card">
      <img
        src={src}
        alt={name}
        className="product-image"
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          borderRadius: '10px'
        }}
      />
      <h3 className="product-name">{name}</h3>
      <p className="product-description">{description}</p>
      <p className="product-price">{displayPrice}</p>
      <Link to={`/products/${id}`} className="details">
        Details
      </Link>
    </div>
  );
};

export default ProductCard;
