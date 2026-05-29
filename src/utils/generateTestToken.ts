import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function generateTestToken(userId: string = 'test-user-123'): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

if (require.main === module) {
  const token = generateTestToken();
  console.log('Test Token:');
  console.log(token);
  console.log('\nUse it like this:');
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/tasks`);
}
