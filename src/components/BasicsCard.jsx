import { useRef } from 'react';
import { IconMail, IconPhone, IconPin, IconCamera } from './icons';

export default function BasicsCard({ basics, dispatch }) {
  const fileInputRef = useRef(null);

  function updateField(field, value) {
    dispatch({ type: 'UPDATE_BASICS', field, value });
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => dispatch({ type: 'SET_PHOTO', dataUrl: reader.result });
    reader.readAsDataURL(file);
  }

  return (
    <div className="basics-card">
      <div className="basics-fields">
        <input
          className="basics-name-input"
          type="text"
          placeholder="Your name"
          value={basics.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
        <label className="basics-row">
          <IconMail size={16} />
          <input
            type="email"
            placeholder="Email"
            value={basics.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </label>
        <label className="basics-row">
          <IconPhone size={16} />
          <input
            type="tel"
            placeholder="Phone"
            value={basics.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </label>
        <label className="basics-row">
          <IconPin size={16} />
          <input
            type="text"
            placeholder="Address"
            value={basics.address}
            onChange={(e) => updateField('address', e.target.value)}
          />
        </label>
      </div>

      <button
        type="button"
        className="basics-photo"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Upload photo"
      >
        {basics.photo ? (
          <img src={basics.photo} alt="Profile" />
        ) : (
          <IconCamera size={22} />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handlePhotoChange}
      />
    </div>
  );
}
