document.addEventListener('DOMContentLoaded', async function () {
  const bookList = document.getElementById('book-list');
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');

  // Fetch and display books
  async function fetchBooks() {
    try {
      const response = await fetch('/books');
      const books = await response.json();

      books.forEach((book) => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');
        bookCard.innerHTML = `
          <img src="${book.image}" alt="${book.title}">
          <h3>${book.title}</h3>
          <p><strong>Author:</strong> ${book.author}</p>
          <p>${book.description}</p>
          <p><strong>Price:</strong> $${book.price}</p>
          <button class="add-to-cart" data-id="${book.id}">Add to Cart</button>
        `;
        bookList.appendChild(bookCard);
      });

      // Attach event listeners to all "Add to Cart" buttons
      const addToCartButtons = document.querySelectorAll('.add-to-cart');
      addToCartButtons.forEach((button) => {
        button.addEventListener('click', async (event) => {
          const bookId = event.target.getAttribute('data-id');
          await addToCart(bookId);
        });
      });
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  }

  // Fetch and display cart items
  async function updateCartUI() {
    try {
      const response = await fetch('/cart');
      const cart = await response.json();

      cartCount.textContent = cart.length;

      if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
      } else {
        cartItems.innerHTML = cart
          .map(
            (item) => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-details">
              <h3 class="cart-item-title">${item.title}</h3>
              <p class="cart-item-author"><strong>Author:</strong> ${item.author}</p>
              <p class="cart-item-price"><strong>Price:</strong> $${item.price}</p>
            </div>
            <button class="remove-from-cart" data-id="${item.id}">Remove</button>
          </div>
        `
          )
          .join('');

        // Attach event listeners to all "Remove" buttons
        const removeFromCartButtons = document.querySelectorAll('.remove-from-cart');
        removeFromCartButtons.forEach((button) => {
          button.addEventListener('click', async (event) => {
            const bookId = event.target.getAttribute('data-id');
            await removeFromCart(bookId);
          });
        });
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }

  // Add book to cart
  async function addToCart(bookId) {
    try {
      const response = await fetch(`/cart/add/${bookId}`, { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        alert('Book added to cart!');
        updateCartUI();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error adding book to cart:', error);
    }
  }

  // Remove book from cart
  async function removeFromCart(bookId) {
    try {
      const response = await fetch(`/cart/remove/${bookId}`, { method: 'DELETE' });
      const result = await response.json();

      if (result.success) {
        alert('Book removed from cart!');
        updateCartUI();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error removing book from cart:', error);
    }
  }

  // Initialize UI
  fetchBooks();
  updateCartUI();
});
