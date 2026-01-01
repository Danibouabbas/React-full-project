import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : "http://localhost:5000/api";

function Admin() {
  const [menu, setMenu] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("food");
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    const res = await axios.get(`${API}/menu`);
    setMenu(res.data);
  };

  const addItem = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category.toLowerCase()); // IMPORTANT
    formData.append("image", image);

    try {
      await axios.post(`${API}/menu`, formData);
      setName("");
      setDescription("");
      setPrice("");
      setCategory("food");
      setImage(null);
      document.getElementById("fileInput").value = "";
      loadMenu();
    } catch (err) {
      console.error("Error adding item:", err.response?.data || err.message);
      alert("Failed to add item");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Menu</h2>

      <form onSubmit={addItem} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="food">Food</option>
          <option value="drinks">Drinks</option>
        </select>

        <button type="submit">Add Item</button>
      </form>

      <hr />

      <div>
        {menu.map((item) => (
          <div key={item.id}>
            <img
              src={`${process.env.REACT_APP_BACKEND_URL}${item.image_url}`}
              alt={item.name}
              width="100"
            />
            <h4>{item.name}</h4>
            <p>${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
