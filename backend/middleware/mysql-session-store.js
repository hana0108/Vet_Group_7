const session = require('express-session');

class MySQLSessionStore extends session.Store {
    constructor(pool) {
        super();
        this.pool = pool;
        this.tableReady = null;
    }

    ensureTable() {
        if (!this.tableReady) {
            this.tableReady = this.pool.query(
                `CREATE TABLE IF NOT EXISTS express_sessions (
                    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
                    expires BIGINT UNSIGNED NOT NULL,
                    data MEDIUMTEXT NOT NULL
                ) ENGINE=InnoDB`
            );
        }

        return this.tableReady;
    }

    get(sid, callback) {
        this.ensureTable()
            .then(() => this.pool.query(
                'SELECT expires, data FROM express_sessions WHERE session_id = ?',
                [sid]
            ))
            .then(async ([rows]) => {
                const row = rows[0];
                if (!row) {
                    callback(null, null);
                    return;
                }
                if (Number(row.expires) <= Date.now()) {
                    await this.pool.query(
                        'DELETE FROM express_sessions WHERE session_id = ?',
                        [sid]
                    );
                    callback(null, null);
                    return;
                }

                callback(null, JSON.parse(row.data));
            })
            .catch(callback);
    }

    set(sid, sessionData, callback) {
        const expires = sessionData.cookie?.expires
            ? new Date(sessionData.cookie.expires).getTime()
            : Date.now() + (sessionData.cookie?.maxAge || 60 * 60 * 1000);

        this.ensureTable()
            .then(() => this.pool.query(
                `INSERT INTO express_sessions (session_id, expires, data)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data)`,
                [sid, expires, JSON.stringify(sessionData)]
            ))
            .then(() => callback())
            .catch(callback);
    }

    touch(sid, sessionData, callback) {
        const expires = sessionData.cookie?.expires
            ? new Date(sessionData.cookie.expires).getTime()
            : Date.now() + (sessionData.cookie?.maxAge || 60 * 60 * 1000);

        this.ensureTable()
            .then(() => this.pool.query(
                'UPDATE express_sessions SET expires = ? WHERE session_id = ?',
                [expires, sid]
            ))
            .then(() => callback())
            .catch(callback);
    }

    destroy(sid, callback) {
        this.ensureTable()
            .then(() => this.pool.query(
                'DELETE FROM express_sessions WHERE session_id = ?',
                [sid]
            ))
            .then(() => callback())
            .catch(callback);
    }
}

module.exports = MySQLSessionStore;
