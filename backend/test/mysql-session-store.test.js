const assert = require('node:assert/strict');
const test = require('node:test');
const MySQLSessionStore = require('../middleware/mysql-session-store');

function createPool() {
    const sessions = new Map();
    const statements = [];
    return {
        sessions,
        statements,
        async query(sql, values = []) {
            statements.push(sql);
            if (sql.includes('SELECT expires, data')) {
                const row = sessions.get(values[0]);
                return [[row ? { ...row } : undefined].filter(Boolean), []];
            }
            if (sql.includes('INSERT INTO express_sessions')) {
                sessions.set(values[0], { expires: values[1], data: values[2] });
                return [{ affectedRows: 1 }, []];
            }
            if (sql.includes('UPDATE express_sessions')) {
                const row = sessions.get(values[1]);
                if (row) row.expires = values[0];
                return [{ affectedRows: row ? 1 : 0 }, []];
            }
            if (sql.includes('DELETE FROM express_sessions')) {
                sessions.delete(values[0]);
                return [{ affectedRows: 1 }, []];
            }
            return [[], []];
        }
    };
}

function invoke(store, method, ...args) {
    return new Promise((resolve, reject) => {
        store[method](...args, (error, value) => {
            if (error) reject(error);
            else resolve(value);
        });
    });
}

test('MySQL session store persists, retrieves, touches, expires and destroys sessions', async () => {
    const pool = createPool();
    const store = new MySQLSessionStore(pool);
    const data = {
        userId: 8,
        cookie: { expires: new Date(Date.now() + 60000).toISOString() }
    };

    await invoke(store, 'set', 'sid-1', data);
    assert.deepEqual(await invoke(store, 'get', 'sid-1'), data);
    await invoke(store, 'touch', 'sid-1', {
        cookie: { expires: new Date(Date.now() + 120000).toISOString() }
    });
    assert.ok(pool.sessions.get('sid-1').expires > Date.now() + 60000);

    pool.sessions.set('sid-expired', {
        expires: Date.now() - 1000,
        data: JSON.stringify(data)
    });
    assert.equal(await invoke(store, 'get', 'sid-expired'), null);
    assert.equal(pool.sessions.has('sid-expired'), false);

    await invoke(store, 'destroy', 'sid-1');
    assert.equal(pool.sessions.has('sid-1'), false);
    assert.equal(
        pool.statements.filter(sql => sql.includes('CREATE TABLE IF NOT EXISTS')).length,
        1
    );
});
