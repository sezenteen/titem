import { useEffect, useState } from 'react';
import axios from 'axios';

const Product = () => {
  const [productData, setProductData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    // We will use a GET request without a body to fetch data.
    // The URL should point to your API endpoint for products.
    axios.get('http://localhost:8080/api/product')
      .then(response => {
        setProductData(response.data);
      })
      .catch(err => {
        console.error("There was an error fetching the product data!", err);
        setError("Failed to fetch product data.");
      });
  }, []); // The empty array ensures this effect runs only once when the component mounts.

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!productData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Product Component</h1>
      <p>This component fetches product data from the server.</p>
      {/* Example of how to display the fetched data */}
      <h2>Product Details</h2>
      {productData.map((product, index) => (
        <div key={index}>
          <p><strong>Name:</strong> {product.name}</p>
          <p><strong>Price:</strong> {product.price}</p>
          <p><strong></strong></p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default Product;