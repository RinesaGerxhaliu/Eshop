import React, { useState, useEffect } from "react";
import axios from "axios";
import RoleChangeModal from "./RoleChangeModal";
import "../Styles/manageusers.css";
import { useAuth } from "../contexts/AuthContext";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const { refreshAccessToken } = useAuth();

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      setLoading(true);
      try {
        await refreshAccessToken();

        const token = localStorage.getItem("token");

        const usersRes = await axios.get(
          "http://localhost:9090/admin/realms/myrealm/users",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(usersRes.data);

        const clientRes = await axios.get(
          "http://localhost:9090/admin/realms/myrealm/clients?clientId=myclient",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const clientId = clientRes.data[0]?.id;

        const rolesMap = {};

        for (const user of usersRes.data) {
          try {
            const [clientRolesRes, realmRolesRes] = await Promise.all([
              axios.get(
                `http://localhost:9090/admin/realms/myrealm/users/${user.id}/role-mappings/clients/${clientId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              ),
              axios.get(
                `http://localhost:9090/admin/realms/myrealm/users/${user.id}/role-mappings/realm`,
                { headers: { Authorization: `Bearer ${token}` } }
              ),
            ]);

            const allRoles = [
              ...clientRolesRes.data,
              ...realmRolesRes.data,
            ];

            const relevantRoles = allRoles
              .map((r) => r.name.toLowerCase())
              .filter((r) => ["admin", "user"].includes(r));

            const finalRole = relevantRoles.length > 0 ? relevantRoles[relevantRoles.length - 1] : "User";

            rolesMap[user.id] = finalRole.charAt(0).toUpperCase() + finalRole.slice(1);
          } catch (err) {
            rolesMap[user.id] = "User";
          }
        }

        setUserRoles(rolesMap);
      } catch (err) {
        console.error(err);
        setError("Gabim gjatë ngarkimit të përdoruesve ose roleve.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndRoles();
  }, []);

  const updateUserRole = (userId, newRole) => {
    setUserRoles((prevRoles) => ({
      ...prevRoles,
      [userId]: newRole.charAt(0).toUpperCase() + newRole.slice(1),
    }));
  };

  if (loading) return <div className="userlist-loading">Ngarkohet...</div>;
  if (error) return <div className="userlist-error">{error}</div>;

  return (
    <div className="userlist-container">
      <header className="userlist-header">
        <h1>Manage Users</h1>
      </header>
      <table className="userlist-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{userRoles[user.id]}</td>
              <td>
                <button onClick={() => setSelectedUser(user)}>
                Update Role
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <RoleChangeModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRoleChange={updateUserRole} 
        />
      )}
    </div>
  );
};

export default UserList;
