const userBtn = document.getElementById('user-btn');
const productBtn = document.getElementById('product-btn');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('matches');

const createUser = () => {
  const URL ='http://localhost:8080/users';
  const userId  = document.getElementById('user-id').value;
  const userFullName  = document.getElementById('user-fullName').value;
  const userUserName  = document.getElementById('user-userName').value;
  const userPassword  = document.getElementById('user-password').value;
  const userEmail  = document.getElementById('user-email').value;
  try {
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: userId ,fullName: userFullName ,userName: userUserName ,
        password: userPassword ,email: userEmail }),
    });
  } catch (error) {
    console.error(error);
  }
};

userBtn.addEventListener('click', (event) => {
  event.preventDefault();
  createUser();
});

productBtn.addEventListener('click', (event) => {
  event.preventDefault();
  create('http://localhost:8080/products', 'product-name');
});

searchBtn.addEventListener('click', (event) => {
  event.preventDefault();
  try {
    fetch('http://localhost:8080/search')
      .then((response) => response.json())
      .then((results) => {
        results.forEach((data) => {
          searchResults.innerHTML += `
            <li>
              <p>${data.name}</p>
              <p>${data.type}</p>
            </li>
          `;
        });
      });
  } catch (error) {
    console.error(error);
  }
  return false;
});
