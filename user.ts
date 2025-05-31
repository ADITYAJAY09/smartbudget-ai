import { query, QueryResult } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { User } from './types';

export async function createUser(email: string, passwordHash: string, name: string): Promise<string> {
  const id = uuidv4();
  await query(
    'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
    [id, email, passwordHash, name]
  );
  return id;
}

export async function getUserById(id: string): Promise<User | null> {
  const results = await query<User>(
    'SELECT id, email, name, created_at FROM users WHERE id = ?', 
    [id]
  );
  return results[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const results = await query<User>(
    'SELECT id, email, name, created_at FROM users WHERE email = ?', 
    [email]
  );
  return results[0] || null;
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  const allowedFields = ['name', 'email'];
  const updates = Object.entries(data)
    .filter(([key]) => allowedFields.includes(key))
    .map(([key]) => `${key} = ?`);
  
  if (updates.length === 0) return;

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  const values = [...Object.values(data), id];
  
  await query(sql, values);
}

export async function deleteUser(id: string): Promise<void> {
  await query('DELETE FROM users WHERE id = ?', [id]);
}

export async function validateUserCredentials(email: string, passwordHash: string): Promise<User | null> {
  const results = await query<User>(
    'SELECT id, email, name, created_at FROM users WHERE email = ? AND password_hash = ?',
    [email, passwordHash]
  );
  return results[0] || null;
}
