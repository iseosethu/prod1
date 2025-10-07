import bcrypt from 'bcrypt';

const password = 'python$123';

bcrypt.hash(password, 10).then((hash) => {
  console.log('Hashed password:', hash);
});