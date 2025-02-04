document.addEventListener('DOMContentLoaded', async () => {
  const addBookBtn = document.getElementById('add-book-btn');
  const addBookForm = document.getElementById('add-book-form');
  const bookForm = document.getElementById('book-form');
  const booksContainer = document.getElementById('books-container');


  addBookBtn.addEventListener('click', () => {
    addBookForm.classList.toggle('hidden');
  });

  bookForm.addEventListener('submit', async (event) => {
    event.preventDefault();  // Prevent the form from refreshing the page

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);
    const image = document.getElementById('image').value;

    try {
      const response = await fetch('/books/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, description, price, image }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Book added successfully!');
        
        // You can update the book list dynamically without refreshing
        const newBook = document.createElement('div');
        newBook.classList.add('book');
        newBook.innerHTML = `
          <h3>${title}</h3>
          <p><strong>Author:</strong> ${author}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Price:</strong> $${price}</p>
        `;
        booksContainer.appendChild(newBook);
        
        // Optionally, clear the form fields after submission
        bookForm.reset();
      } else {
        alert('Failed to add the book.');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('There was an error adding the book.');
    }
  });

  async function fetchBooks() {
    try {
      const response = await fetch('/books');
      const books = await response.json();

      // Clear the current book list
      booksContainer.innerHTML = '';

      if (books.length === 0) {
        booksContainer.innerHTML = '<p>No books found in the library.</p>';
        return;
      }

      // Display books
      books.forEach((book) => {
        const bookDiv = document.createElement('div');
        bookDiv.classList.add('book');
        bookDiv.innerHTML = `
          <h3>${book.title}</h3>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Description:</strong> ${book.description}</p>
          <p><strong>Price:</strong> $${book.price}</p>
          <button class="delete-book" data-id="${book.id}">Delete</button>
        `;
        booksContainer.appendChild(bookDiv);
      });

      // Add event listeners for delete buttons
      const deleteButtons = document.querySelectorAll('.delete-book');
      deleteButtons.forEach((button) => {
        button.addEventListener('click', async (event) => {
          const bookId = event.target.getAttribute('data-id');
          await deleteBook(bookId);
        });
      });
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }

  async function addBook(bookData) {
    try {
      const response = await fetch('/books/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });
      const result = await response.json();

      if (result.success) {
        alert('Book added successfully!');
        fetchBooks(); // Refresh the book list
      } else {
        alert('Failed to add the book.');
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  }

  async function deleteBook(bookId) {
    try {
      const response = await fetch(`/books/delete/${bookId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        alert('Book deleted successfully!');
        fetchBooks(); // Refresh the book list
      } else {
        alert('Failed to delete the book.');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  }

  // Fetch and display books on page load
  fetchBooks();
});
