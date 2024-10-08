import { Request, Response } from 'express';
import db from '../database/db';
import { User } from '../models/user.model';

export const getUsers = (req: Request, res: Response) => {
    db.all("SELECT * FROM users", (err: any, users: User[]) => {
		if (err) {
			res.status(500).json({ error: err.message });
			return;
		}
		res.json({ users });
	})
}

export const getUser = (req: Request, res: Response) => {
	const id = req.params.id;
	db.get("SELECT * FROM users WHERE user_id = ?", [id], (err: any, user: User) => {
		if (err) {
			res.status(500).json({ error: err.message });
			return;
		}
		res.json({ user });
	})
}

export const createUser = (req: Request, res: Response) => {
	// Extract all fields from req.body
	const user = req.body as User;

	// Check if the request body is empty
	if (Object.keys(user).length === 0) {
        res.status(400).json({ error: "No data provided" });
        return;
    }

	// Extract all keys and values from the request body
	const keys = Object.keys(user);
	const values = Object.values(user);

	// Construct the SQL query dynamically
	const valuePlaceholders = keys.map(() => '?').join(', ');
	const columns = keys.join(', ');
	const sql = `INSERT INTO users (${columns}) VALUES (${valuePlaceholders})`;

	db.run(sql, values, function (this: any, err: any) {
		if (err) {
			res.status(500).json({ error: err.message });
			return;
		}
		// Construct the response object dynamically
		const response: { [key: string]: any } = { id: this.lastID };
		keys.forEach((key, index) => {
			response[key] = values[index];
		});
		res.status(201).json(response);
	});
};

export const updateUser = (req: Request, res: Response) => {
	const id = req.params.id;
	// Extract all fields from req.body
	const updates = req.body as Partial<User>;
	const updateKeys = Object.keys(updates).filter(key => key !== 'id'); // Exclude the id field from the update

	if (updateKeys.length === 0) {
		res.status(400).json({ error: 'No update fields provided' });
		return;
	}

	// Construct the SQL query dynamically
	const setClause = updateKeys.map(key => `${key} = ?`).join(', ');
	const values = updateKeys.map(key => updates[key as keyof Partial<User>]);

	const sql = `UPDATE users SET ${setClause} WHERE user_id = ?`;

	db.run(sql, [...values, id], function (err) {
		if (err) {
			res.status(500).json({ error: err.message });
			return;
		}
		res.json({ message: 'User updated successfully' });
	});
};

export const deleteUser = (req: Request, res: Response) => {
	const id = req.params.id;
	db.run('DELETE FROM users WHERE user_id = ?', [id], function (err) {
		if (err) {
			res.status(500).json({ error: err.message });
			return;
		}
		res.json({ message: 'User deleted successfully' });
	});
};