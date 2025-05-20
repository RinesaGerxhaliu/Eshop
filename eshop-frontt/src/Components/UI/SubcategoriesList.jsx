import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../Styles/ManageProducts.css";

const API = "https://localhost:5050";
const PAGE_SIZE = 8;

export default function SubcategoryList() {
  const { categoryId } = useParams();
  const nav = useNavigate();
  const [subs, setSubs] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadSubcategories() {
      try {
        const params = new URLSearchParams({
          PageIndex: pageIndex,
          PageSize: PAGE_SIZE,
        });
        const res = await fetch(
          `${API}/categories/${categoryId}/subcategories?${params}`,
          { mode: "cors" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const page = data.subcategories ?? data.Subcategories ?? {};
        const items = Array.isArray(page.data)
          ? page.data
          : Array.isArray(page.items)
            ? page.items
            : [];

        setSubs(items);

        const count = typeof page.count === "number"
          ? page.count
          : typeof page.totalCount === "number"
            ? page.totalCount
            : typeof page.totalItems === "number"
              ? page.totalItems
              : items.length;
        setTotalCount(count);
      } catch (err) {
        console.error("Failed to load subcategories:", err);
        setSubs([]);
        setTotalCount(0);
      }
    }

    loadSubcategories();
  }, [categoryId, pageIndex]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <button
        className="mp-btn mp-btn-secondary"
        onClick={() => nav("/admin-dashboard/manage-categories")}
        style={{ marginBottom: 12 }}
      >
        ← Back to Categories
      </button>

      <div className="mp-table-wrap">
        <table className="mp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.length > 0 ? (
              subs.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>
                    <button className="mp-btn mp-btn-action">
                      Edit
                    </button>
                    <button
                      className="mp-btn mp-btn-danger"
                      style={{ marginLeft: 8 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ textAlign: "center", padding: 20 }}>
                  No subcategories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
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
