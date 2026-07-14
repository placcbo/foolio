import { useRef, useState } from 'react';
import {
  IconMail,
  IconPhone,
  IconPin,
  IconCamera,
  IconEdit,
  IconBulb,
  IconCheck,
  IconChevronsUpDown,
} from './icons';

export default function BasicsCard({ basics, dispatch }) {
  const fileInputRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

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

  const photoInput = (
    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
  );

  if (expanded) {
    return (
      <div className="basics-edit-card">
        <div className="basics-edit-header">
          <h3>Edit Personal Details</h3>
          <button type="button" className="get-tips-btn">
            <IconBulb size={16} />
            Get Tips
          </button>
        </div>

        <div className="basics-edit-toprow">
          <div className="basics-edit-col">
            <div className="basics-edit-field">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={basics.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div className="basics-edit-field">
              <label>Professional title</label>
              <input
                type="text"
                placeholder="Target position or current role"
                value={basics.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>
          </div>

          <div className="basics-edit-photo-col">
            <label>Photo</label>
            <button
              type="button"
              className="basics-photo basics-photo-lg"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload photo"
            >
              {basics.photo ? <img src={basics.photo} alt="Profile" /> : <IconCamera size={26} />}
            </button>
          </div>
        </div>

        <div className="basics-edit-field">
          <label>Email</label>
          <div className="basics-edit-input-row">
            <input
              type="email"
              placeholder="Enter email"
              value={basics.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
            <span className="reorder-handle" aria-hidden="true">
              <IconChevronsUpDown size={16} />
            </span>
          </div>
        </div>

        <div className="basics-edit-field">
          <label>Phone</label>
          <div className="basics-edit-input-row">
            <input
              type="tel"
              placeholder="Enter Phone"
              value={basics.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            <span className="reorder-handle" aria-hidden="true">
              <IconChevronsUpDown size={16} />
            </span>
          </div>
        </div>

        <div className="basics-edit-field">
          <label>Location</label>
          <div className="basics-edit-input-row">
            <input
              type="text"
              placeholder="Enter Location"
              value={basics.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
            <span className="reorder-handle" aria-hidden="true">
              <IconChevronsUpDown size={16} />
            </span>
          </div>
        </div>

        <div className="basics-edit-footer">
          <button type="button" className="done-btn" onClick={() => setExpanded(false)}>
            <IconCheck size={18} />
            Done
          </button>
        </div>

        {photoInput}
      </div>
    );
  }

  return (
    <div className="basics-card">
      <button
        type="button"
        className="basics-edit-trigger"
        onClick={() => setExpanded(true)}
        aria-label="Edit personal details"
      >
        <IconEdit size={15} />
      </button>

      <div className="basics-fields">
        <input
          className="basics-name-input"
          type="text"
          placeholder="Your name"
          value={basics.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
        <input
          className="basics-title-input"
          type="text"
          placeholder="Job title"
          value={basics.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
        <label className="basics-row">
          <IconMail size={20} />
          <input
            type="email"
            placeholder="Email"
            value={basics.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </label>
        <label className="basics-row">
          <IconPhone size={20} />
          <input
            type="tel"
            placeholder="Phone"
            value={basics.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </label>
        <label className="basics-row">
          <IconPin size={20} />
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
        {basics.photo ? <img src={basics.photo} alt="Profile" /> : <IconCamera size={30} />}
      </button>

      {photoInput}
    </div>
  );
}