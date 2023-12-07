const mockedUser = {
    uid: '123',
    email: 'a@a',
    // ... d'autres propriétés si nécessaire
  };
  
  const mockedStore = {
    user: jest.fn(() => mockedUser),
    users: jest.fn(),
    login: jest.fn(),
    ref: jest.fn(),
    bill: jest.fn(),
    bills: jest.fn(),
  };
  
  export default jest.fn(() => mockedStore);