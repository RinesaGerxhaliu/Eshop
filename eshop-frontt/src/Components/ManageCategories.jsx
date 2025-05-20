import { Outlet, useNavigate, useParams, Link } from "react-router-dom"


export default function ManageCategories() {
    const nav = useNavigate()
    return (
        <div className="mp-container">
            <header className="mp-header">
                <h1>Manage Categories</h1>
                <button
                    className="mp-btn mp-btn-primary"
                    onClick={() => nav("/dashboard/categories/add")}
                >
                    + Add Category
                </button>
            </header>
            <Outlet />
        </div>
    )
}
