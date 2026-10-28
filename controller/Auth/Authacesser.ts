import {pool} from "../../model/database"

export class AuthAccesser {
 

 async findByEmail(email: string) {

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        return result.rows[0];
    }

    async findById(id: string) {
        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE id = $1",
            [id]
        );

        return result.rows[0];
    }

    async createUser(name: string, email: string, password: string) {
        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, password]
        );

        return result.rows[0];

 




    }
}