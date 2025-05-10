import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoleChangeModal = ({ user, onClose }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRoleObj, setSelectedRoleObj] = useState(null);
  const [clientUUID, setClientUUID] = useState('');
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchClientUUIDAndRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const clientRes = await axios.get(
          'http://localhost:9090/admin/realms/myrealm/clients?clientId=myclient',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const client = clientRes.data[0];
        if (!client) {
          alert("Client not found.");
          return;
        }

        const clientId = client.id;
        setClientUUID(clientId);

        const rolesRes = await axios.get(
          `http://localhost:9090/admin/realms/myrealm/clients/${clientId}/roles`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setRoles(rolesRes.data);
      } catch (err) {
        alert('Failed to load roles.');
        console.error(err);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchClientUUIDAndRoles();
  }, []);

  const handleRoleChange = async () => {
    if (!selectedRoleObj || !clientUUID) {
      alert("Please select a role.");
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `http://localhost:9090/admin/realms/myrealm/users/${user.id}/role-mappings/clients/${clientUUID}`,
        [selectedRoleObj],
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccessMessage('✅ Role updated successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Error while updating role:', err);
      alert('Error while updating role.');
    }
  };

  return (
    <div style={modalStyle}>
      <h2>Change role for: <strong>{user?.username}</strong></h2>
      
      {successMessage && (
        <div style={{ marginTop: '1rem', color: 'green', fontWeight: 'bold' }}>
          {successMessage}
        </div>
      )}

      {loadingRoles ? (
        <p>Loading roles...</p>
      ) : (
        <select
          value={selectedRole}
          onChange={(e) => {
            const selected = roles.find(role => role.name === e.target.value);
            setSelectedRole(selected.name);
            setSelectedRoleObj(selected);
          }}
          style={{ padding: '0.5rem', width: '100%', marginTop: '1rem' }}
        >
          <option value="">-- Select a role --</option>
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleRoleChange} style={{ padding: '0.5rem 1rem' }}>
          Confirm
        </button>
        <button onClick={onClose} style={{ padding: '0.5rem 1rem', marginLeft: '10px' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#fff',
  padding: '2rem',
  borderRadius: '10px',
  zIndex: 1000,
  width: '400px',
  maxWidth: '90%',
  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
};

export default RoleChangeModal;
