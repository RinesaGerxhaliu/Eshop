import React, { useState, useEffect } from "react";
import axios from "axios";
import RoleChangeModal from "./RoleChangeModal";
import "../Styles/manageusers.css"; // Shtojmë një CSS për stilizim të ngjashëm

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:9090/admin/realms/myrealm/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data);
      } catch (err) {
        setError("Gabim gjatë thirrjes së përdoruesve");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="userlist-loading">Ngarkohet...</div>;
  if (error) return <div className="userlist-error">{error}</div>;

  return (
    <div className="userlist-container">
      <header className="userlist-header">
        <h1>Manage Users</h1>
      </header>
      <div className="userlist-table-wrap">
        <table className="userlist-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  <button
                    className="userlist-btn userlist-btn-action"
                    onClick={() => setSelectedUser(user)}
                  >
                    Change Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <>
          <div
            className="userlist-overlay"
            onClick={() => setSelectedUser(null)}
          ></div>
          <RoleChangeModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        </>
      )}
    </div>
  );
};

export default UserList;
