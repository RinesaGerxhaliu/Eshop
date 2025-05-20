import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/ManageProducts.css";

const API = "https://localhost:5050";
const PAGE_SIZE = 8;

export default function CategoryList() {
  const [cats, setCats] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const params = new URLSearchParams({
          PageIndex: pageIndex,
          PageSize: PAGE_SIZE,
        });
        const res = await fetch(`${API}/categories?${params}`, {
          mode: "cors",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const page = data.categories ?? data.Categories ?? {};

        const items = Array.isArray(page.data)
          ? page.data
          : Array.isArray(page.items)
            ? page.items
            : [];

        const count = typeof page.count === "number"
          ? page.count
          : typeof page.totalCount === "number"
            ? page.totalCount
            : typeof page.totalItems === "number"
              ? page.totalItems
              : items.length;

        setCats(items);
        setTotalCount(count);
      } catch (err) {
        console.error("Failed loading categories:", err);
        setCats([]);
        setTotalCount(0);
      }
    };

    fetchCategories();
  }, [pageIndex]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <div className="mp-table-wrap" style={{ marginTop: 20 }}>
        <table className="mp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Products Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cats.length > 0 ? (
              cats.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    {typeof c.productCount === "number"
                      ? c.productCount
                      : "–"}
                  </td>
                  <td>
                    <button
                      className="mp-btn mp-btn-action"
                      onClick={() => nav(`${c.id}/subcategories`)}
                    >
                      View Subcategories
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: 20 }}>
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mp-pagination">
          <button
            className="mp-btn mp-btn-secondary"
            onClick={() => setPageIndex(i => Math.max(i - 1, 0))}
            disabled={pageIndex === 0}
          >
            ← Prev
          </button>
          <span style={{ margin: "0 12px" }}>
            Page {pageIndex + 1} of {totalPages}
          </span>
          <button
            className="mp-btn mp-btn-secondary"
            onClick={() => setPageIndex(i => Math.min(i + 1, totalPages - 1))}
            disabled={pageIndex + 1 >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}
