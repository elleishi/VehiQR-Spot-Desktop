import React, { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';
import '../src/style/Settings.css';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Swal from 'sweetalert2';

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editInfo, setEditInfo] = useState({
    email: '',
    password: '', // Old password
    newPassword: '', // New password
  });

  // Fetch Users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'user'));
        const userData = querySnapshot.docs.map((doc) => {
          const user = doc.data();
          return {
            id: doc.id,
            email: user.email || 'N/A',
            password: user.password || 'N/A',
          };
        });
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        Swal.fire('Error', 'Failed to fetch user data. Please try again.', 'error');
      }
    };
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setEditInfo({ email: user.email, password: '', newPassword: '' });
    setShowEditForm(true);
  };

  const handleCloseModal = () => {
    setShowEditForm(false);
    setCurrentUser(null);
  };

  const handleSaveClick = async () => {
    if (!editInfo.password || editInfo.password.length < 6) {
      Swal.fire('Error', 'Password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      const userRef = doc(db, 'user', currentUser.id);

      const updateData = {
        email: editInfo.email,
      };

      // Only include newPassword if it's provided
      if (editInfo.newPassword) {
        updateData.password = editInfo.newPassword;
      }

      await updateDoc(userRef, updateData);

      Swal.fire('Success', 'User information updated successfully.', 'success');
      setShowEditForm(false);
      setCurrentUser(null);

      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === currentUser.id
            ? {
                ...user,
                email: editInfo.email,
                password: editInfo.newPassword || editInfo.password,
              }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user:', error);
      Swal.fire('Error', 'Failed to update user information.', 'error');
    }
  };

  return (
    <div className="UserTable">
      <table className="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.password || 'N/A'}</td>
              <td>
                <button onClick={() => handleEditClick(user)} className="btn">
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Editing User */}
      {showEditForm && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User Information</h3>
            <input
              type="email"
              value={editInfo.email}
              onChange={(e) => setEditInfo({ ...editInfo, email: e.target.value })}
              placeholder="Email"
            />
            <input
              type="password"
              value={editInfo.password}
              onChange={(e) => setEditInfo({ ...editInfo, password: e.target.value })}
              placeholder="Old Password"
            />
            <input
              type="password"
              value={editInfo.newPassword}
              onChange={(e) => setEditInfo({ ...editInfo, newPassword: e.target.value })}
              placeholder="New Password"
            />
            <div className="button-container">
              <button onClick={handleCloseModal} className="btn">
                Cancel
              </button>
              <button onClick={handleSaveClick} className="btn create">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
