// Mock para o módulo jsonwebtoken
const jwt = {
  sign: jest.fn().mockImplementation((payload, secret, options) => {
    return 'mock-jwt-token';
  }),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'mock-jwt-token' || token === 'Bearer mock-jwt-token') {
      return {
        userId: 1,
        email: 'teste@example.com',
        role: 'USER',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400
      };
    }
    throw new Error('Invalid token');
  })
};

export default jwt;