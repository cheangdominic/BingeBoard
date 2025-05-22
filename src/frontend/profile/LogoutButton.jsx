function LogoutButton() {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = '/login';
      }
    } catch (error) {
      alert('An error occurred during logout.');
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-blue-500 hover:bg-amber-400 hover:text-black text-white font-semibold rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        Logout
      </button>
    </div>
  );
}

export default LogoutButton;
