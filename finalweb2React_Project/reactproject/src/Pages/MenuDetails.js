import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

export default function MenuDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/menu`)
      .then((res) => {
        const foundItem = res.data.find(
          (i) => i.id === Number(id)
        );
        setItem(foundItem);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  if (!item) {
    return <p className="loading">Item not found</p>;
  }

  return (
    <div className="details-page">
      <Link to="/" className="back-btn">← Back</Link>

      <div className="details-card">
        <img
          src={`${BACKEND_URL}${item.image_url}`}
          alt={item.name}
          className="details-image"
        />

        <div className="details-info">
          <h2>{item.name}</h2>
          <p className="details-price">
            ${Number(item.price).toFixed(2)}
          </p>
          <p className="details-description">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}
