import React, { useRef, useState } from 'react';
import { Camera, Trash2, Loader2, Sparkles, Upload } from 'lucide-react';
import { processImageFile } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

function initialsOf(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U';
}

export default function ProfileAvatarUploader({
  avatar = '',
  name = '',
  size = 72,
  borderRadius = 22,
  onAvatarChange,
  isEditable = true
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again if needed
    e.target.value = '';

    setIsUploading(true);
    const toastId = toast.loading('Optimizing & uploading profile picture...');

    try {
      // Crop to square, scale to 400x400, optimize quality
      const processedDataUrl = await processImageFile(file, 400, 0.88);

      if (onAvatarChange) {
        await onAvatarChange(processedDataUrl);
      }

      toast.success('Profile picture updated successfully!', { id: toastId });
    } catch (err) {
      console.error('[ProfileAvatarUploader] Upload failed:', err);
      toast.error(err.message || 'Failed to update profile picture.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Remove your profile picture and restore initials?')) return;

    setIsUploading(true);
    const toastId = toast.loading('Removing profile picture...');

    try {
      if (onAvatarChange) {
        await onAvatarChange('');
      }
      toast.success('Profile picture removed.', { id: toastId });
    } catch (err) {
      console.error('[ProfileAvatarUploader] Remove failed:', err);
      toast.error(err.message || 'Failed to remove profile picture.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const hasCustomAvatar = Boolean(avatar && typeof avatar === 'string' && avatar.trim());

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div
        role={isEditable && !isUploading ? 'button' : undefined}
        tabIndex={isEditable && !isUploading ? 0 : undefined}
        onClick={() => {
          if (isEditable && !isUploading) {
            fileInputRef.current?.click();
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && isEditable && !isUploading) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${borderRadius}px`,
          cursor: isEditable && !isUploading ? 'pointer' : 'default',
          userSelect: 'none',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
          border: '2px solid #e2e8f0',
          background: '#ffffff',
          overflow: 'hidden',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease'
        }}
        title={isEditable ? 'Click to change profile picture' : undefined}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={!isEditable || isUploading}
        />

        {/* Avatar Image or Initials */}
        {hasCustomAvatar ? (
          <img
            src={avatar}
            alt={name || 'Profile'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            onError={(e) => {
              // If image fails to load, gracefully hide it so initials fall back
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontSize: `${Math.round(size * 0.4)}px`,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '0.02em'
            }}
          >
            {initialsOf(name)}
          </div>
        )}

        {/* Hover Overlay */}
        {isEditable && !isUploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
              borderRadius: `${borderRadius - 2}px`
            }}
          >
            <Camera size={Math.max(16, Math.round(size * 0.28))} />
            <span
              style={{
                fontSize: `${Math.max(9, Math.round(size * 0.13))}px`,
                fontWeight: 700,
                marginTop: '3px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Change
            </span>
          </div>
        )}

        {/* Loading Spinner Overlay */}
        {isUploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              borderRadius: `${borderRadius - 2}px`
            }}
          >
            <Loader2 size={Math.max(20, Math.round(size * 0.3))} className="animate-spin" />
            <span style={{ fontSize: '10px', fontWeight: 600, marginTop: '4px' }}>Saving...</span>
          </div>
        )}
      </div>

      {/* Action Controls / Remove Button */}
      {isEditable && hasCustomAvatar && !isUploading && (
        <button
          type="button"
          onClick={handleRemovePhoto}
          style={{
            background: 'none',
            border: 'none',
            padding: '2px 8px',
            fontSize: '0.72rem',
            color: '#ef4444',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
            borderRadius: '4px',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Remove profile picture"
        >
          <Trash2 size={11} />
          <span>Remove Photo</span>
        </button>
      )}
    </div>
  );
}
