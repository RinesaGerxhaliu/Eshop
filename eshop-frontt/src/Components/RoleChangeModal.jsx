import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoleChangeModal = ({ user, onClose, onRoleChange }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRoleObj, setSelectedRoleObj] = useState(null);
  const [clientUUID, setClientUUID] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeRoles, setActiveRoles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
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
          alert("Client 'myclient' not found.");
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
    
        const userRolesRes = await axios.get(
          `http://localhost:9090/admin/realms/myrealm/users/${user.id}/role-mappings/clients/${clientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setActiveRoles(userRolesRes.data); 
    
      } catch (err) {
        console.error("Error loading roles or client:", err);
        alert('Failed to load roles or current user roles.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user.id]);
  
  const handleRoleChange = async () => {
    if (!selectedRoleObj || !clientUUID) {
      alert("Please select a role.");
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
  
      await axios.delete(
        `http://localhost:9090/admin/realms/myrealm/users/${user.id}/role-mappings/clients/${clientUUID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: activeRoles,
        }
      );
  
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
  
      setActiveRoles([selectedRoleObj]);
      setSuccessMessage('✅ Roli u ndryshua me sukses!');
  
      onRoleChange(user.id, selectedRoleObj.name);  

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
  
    } catch (err) {
      console.error('Error changing role:', err);
      alert('Ndodhi një gabim gjatë ndryshimit të rolit.');
    }
  };
  
  return (
    <div style={modalStyle}>
      <h2>Change Role: </h2>

      {loading ? (
        <p>Duke ngarkuar të dhënat...</p>
      ) : (
        <>
       

          <select
            value={selectedRole}
            onChange={(e) => {
              const selected = roles.find(role => role.name === e.target.value);
              setSelectedRole(selected.name);
              setSelectedRoleObj(selected);
            }}
            style={{ padding: '0.5rem', width: '100%', marginTop: '1rem' }}
          >
            <option value="">-- Select a new role --</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleRoleChange}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Confirm
            </button>
            <button
              onClick={onClose}
              style={{ padding: '0.5rem 1rem', marginLeft: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              Cancel
            </button>
          </div>

          {successMessage && (
            <div style={{ marginTop: '1rem', color: 'green', fontWeight: 'bold' }}>
              {successMessage}
            </div>
          )}
        </>
      )}
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
