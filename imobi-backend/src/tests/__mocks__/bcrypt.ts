// Mock para o módulo bcrypt
const bcrypt = {
  hash: jest.fn().mockImplementation((password, salt) => {
    return Promise.resolve('$2b$10$abcdefghijklmnopqrstuvwxyz');
  }),
  compare: jest.fn().mockImplementation((password, hash) => {
    // Simular que a senha 'Teste123!' é válida
    return Promise.resolve(password === 'Teste123!');
  }),
  genSalt: jest.fn().mockResolvedValue('10')
};

export default bcrypt;