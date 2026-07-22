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
  IconPlus,
  IconX,
} from './icons';
import { EXTRA_FIELDS, EXTRA_FIELDS_MORE, getExtraFieldMeta } from '../data/extraFields';

export default function BasicsCard({ basics, dispatch, expanded, onExpandedChange, supportsPhoto = true }) {
  const fileInputRef = useRef(null);
  const [showMore, setShowMore] = useState(false);

  function updateField(field, value) {
    dispatch({ type: 'UPDATE_BASICS', field, value });
  }

  function addExtraField(field) {
    dispatch({ type: 'ADD_EXTRA_FIELD', field });
  }

  function removeExtraField(field) {
    dispatch({ type: 'REMOVE_EXTRA_FIELD', field });
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
                autoComplete="name"
                placeholder="Your name"
                value={basics.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div className="basics-edit-field">
              <label>Professional title</label>
              <input
                type="text"
                autoComplete="organization-title"
                placeholder="Target position or current role"
                value={basics.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>
          </div>

          {supportsPhoto && (
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
          )}
        </div>

        <div className="basics-edit-field">
          <label>Email</label>
          <div className="basics-edit-input-row">
            <input
              type="email"
              autoComplete="email"
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
              autoComplete="tel"
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
              autoComplete="off"
              placeholder="Enter Location"
              value={basics.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
            <span className="reorder-handle" aria-hidden="true">
              <IconChevronsUpDown size={16} />
            </span>
          </div>
        </div>

        {basics.visibleExtra.map((key) => {
          const meta = getExtraFieldMeta(key);
          if (!meta) return null;
          return (
            <div className="basics-edit-field" key={key}>
              <label>{meta.label}</label>
              <div className="basics-edit-input-row">
                <input
                  type={meta.inputType || 'text'}
                  placeholder={meta.placeholder}
                  value={basics[key] || ''}
                  onChange={(e) => updateField(key, e.target.value)}
                />
                <button
                  type="button"
                  className="reorder-handle extra-field-remove"
                  onClick={() => removeExtraField(key)}
                  aria-label={`Remove ${meta.label}`}
                >
                  <IconX size={16} />
                </button>
              </div>
            </div>
          );
        })}

        <div className="add-details-block">
          <label className="add-details-label">Add details</label>
          <div className="extra-field-pills">
            {EXTRA_FIELDS.filter((f) => !basics.visibleExtra.includes(f.key)).map((f) => (
              <button
                type="button"
                key={f.key}
                className="extra-field-pill"
                onClick={() => addExtraField(f.key)}
              >
                <IconPlus size={14} />
                {f.label}
              </button>
            ))}
            {showMore &&
              EXTRA_FIELDS_MORE.filter((f) => !basics.visibleExtra.includes(f.key)).map((f) => (
                <button
                  type="button"
                  key={f.key}
                  className="extra-field-pill"
                  onClick={() => addExtraField(f.key)}
                >
                  <IconPlus size={14} />
                  {f.label}
                </button>
              ))}
            <button
              type="button"
              className="show-more-btn"
              onClick={() => setShowMore((v) => !v)}
            >
              {showMore ? 'Show Less' : 'Show More'}
            </button>
          </div>
        </div>

        <div className="basics-edit-footer">
          <button type="button" className="done-btn" onClick={() => onExpandedChange(false)}>
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
        onClick={() => onExpandedChange(true)}
        aria-label="Edit personal details"
      >
        <IconEdit size={15} />
      </button>

      <div className="basics-fields">
        <input
          className="basics-name-input"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={basics.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
        <input
          className="basics-title-input"
          type="text"
          autoComplete="organization-title"
          placeholder="Job title"
          value={basics.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
        <label className="basics-row">
          <IconMail size={20} />
          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={basics.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </label>
        <label className="basics-row">
          <IconPhone size={20} />
          <input
            type="tel"
            autoComplete="tel"
            placeholder="Phone"
            value={basics.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </label>
        <label className="basics-row">
          <IconPin size={20} />
          <input
            type="text"
            autoComplete="off"
            placeholder="Address"
            value={basics.address}
            onChange={(e) => updateField('address', e.target.value)}
          />
        </label>
      </div>

      {supportsPhoto && (
        <button
          type="button"
          className="basics-photo"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Upload photo"
        >
          {basics.photo ? <img src={basics.photo} alt="Profile" /> : <IconCamera size={30} />}
        </button>
      )}

      {photoInput}
    </div>
  );
}