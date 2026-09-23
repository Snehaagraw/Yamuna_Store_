function AccountIcon({ onClick }) {
  return (
    <button
      className="icon-button account-button"
      aria-label="My Account"
      onClick={onClick}
    >
      <span className="account-icon">♙</span>
    </button>
  );
}

export default AccountIcon;