// Mock para o módulo crypto (substituindo bcrypt)
const crypto = {
  randomBytes: jest.fn().mockImplementation((size) => {
    return {
      toString: jest.fn().mockReturnValue('mockedsalt')
    };
  }),
  pbkdf2Sync: jest.fn().mockImplementation((password, salt, iterations, keylen, digest) => {
    return {
      toString: jest.fn().mockReturnValue('mockedhash')
    };
  })
};

export default crypto;