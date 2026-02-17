// src/components/onboarding/PersonalInfoTab.jsx
export default function PersonalInfoTab({ personalInfo, setPersonalInfo, handleSubmit }) {
  return (
    <div className="tab-section">
      <h2 className="tab-title">Personal Information</h2>
      <form className="onboarding-form">
        <label>Email</label>
        <input
          type="email"
          className="onboarding-input"
          value={personalInfo.contact_email}
          onChange={(e) => setPersonalInfo({ ...personalInfo, contact_email: e.target.value })}
        />

        <label>Phone Number</label>
        <input
          type="tel"
          className="onboarding-input"
          value={personalInfo.contact_phone}
          onChange={(e) => setPersonalInfo({ ...personalInfo, contact_phone: e.target.value })}
        />

        <label>Birthdate</label>
        <input
          type="date"
          className="onboarding-input"
          value={personalInfo.birthdate}
          onChange={(e) => setPersonalInfo({ ...personalInfo, birthdate: e.target.value })}
        />

        <label>City</label>
        <input
          type="text"
          className="onboarding-input"
          value={personalInfo.city}
          onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
        />

        <button type="button" onClick={handleSubmit} className="onboarding-submit-button">
          Submit Personal Info
        </button>
      </form>
    </div>
  );
}
