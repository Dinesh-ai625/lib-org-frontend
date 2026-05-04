import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    photoUrl: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
const response = await axios.get('https://lib-org-backend-production.up.railway.app/api/users/profile');      if (response.data) {
        setProfile({
          username: response.data.username || '',
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          bio: response.data.bio || '',
          photoUrl: response.data.photoUrl || ''
        });
        setPhotoPreview(response.data.photoUrl || null);
      }
    } catch (error) {
      console.error('Error fetching profile', error);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPhotoPreview(base64);
      setProfile(prev => ({ ...prev, photoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('https://lib-org-backend-production.up.railway.app/api/users/profile', profile);
      alert('Profile updated successfully! (If you changed your username, it will be updated here and on your next login.)');
      fetchProfile();
    } catch (error) {
      alert(error.response?.data || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.delete('https://lib-org-backend-production.up.railway.app/api/users/account');
        alert('Account deleted successfully.');
        logout();
      } catch (error) {
        alert('Failed to delete account.');
      }
    }
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://lib-org-backend-production.up.railway.app/api/users/change-password', passwords);
      alert('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (error) {
      alert(error.response?.data || 'Failed to change password');
    }
  };

  const displayName = profile.firstName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user?.username;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', color: '#10a37f' }}>Personal Details</h3>

        {/* Profile Photo Upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              overflow: 'hidden',
              border: '2px dashed #d1d5db',
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
              transition: 'border-color 0.2s'
            }}
            title="Click to upload photo"
            onMouseEnter={e => e.currentTarget.style.borderColor = '#10a37f'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
          >
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s', borderRadius: '50%'
                }}
                  className="photo-overlay"
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>EDIT</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px' }}>
                <span style={{ color: '#9ca3af', fontSize: '10px', textAlign: 'center', lineHeight: 1.2 }}>Upload Photo</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
          <div>
            <h4 style={{ color: '#111827', fontSize: '20px' }}>{displayName}</h4>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>{user?.role}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: '8px', background: 'transparent', border: '1px solid #d1d5db',
                color: '#6b7280', padding: '4px 12px', borderRadius: '6px',
                cursor: 'pointer', fontSize: '12px'
              }}
            >
              Change Photo
            </button>
          </div>
        </div>

        <form onSubmit={submitProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>Username (Unique)</label>
            <input type="text" name="username" className="input-field" value={profile.username} onChange={handleProfileChange} required />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>First Name</label>
              <input type="text" name="firstName" className="input-field" value={profile.firstName} onChange={handleProfileChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>Last Name</label>
              <input type="text" name="lastName" className="input-field" value={profile.lastName} onChange={handleProfileChange} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>Email Address</label>
            <input type="email" name="email" className="input-field" value={profile.email} onChange={handleProfileChange} required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>Personal Bio</label>
            <textarea name="bio" className="input-field" value={profile.bio} onChange={handleProfileChange} style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Tell us about yourself..." />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px', color: '#8b5cf6' }}>Security Settings</h3>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Change your account password here.</p>

        <form onSubmit={submitPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>Current Password</label>
            <input type="password" name="currentPassword" className="input-field" value={passwords.currentPassword} onChange={handlePasswordChange} required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>New Password</label>
            <input type="password" name="newPassword" className="input-field" value={passwords.newPassword} onChange={handlePasswordChange} required />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', background: '#8b5cf6' }}>Update Password</button>
        </form>

        <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <h4 style={{ color: '#ef4444', marginBottom: '10px' }}>Danger Zone</h4>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '15px' }}>Deleting your account is permanent. All your data will be wiped.</p>
          <button 
            onClick={handleDeleteAccount}
            style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
