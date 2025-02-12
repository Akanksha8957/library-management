document.getElementById('user-login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = result.redirect; // Redirect based on server response
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error during user login:', error);
    alert('An error occurred. Please try again later.');
  }
});
