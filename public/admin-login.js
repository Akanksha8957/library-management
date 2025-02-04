document.getElementById('admin-login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = result.redirect; // Redirect to admin dashboard
    } else {
      alert(result.message); // Show error message
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    alert('An error occurred. Please try again later.');
  }
});
