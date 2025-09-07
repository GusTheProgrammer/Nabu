import Database from '@tauri-apps/plugin-sql';

import {ClipboardContentType, ClipboardEntry} from '@/types/clipboard.ts';
import Logger from '@/util/logger.ts';

class ClipboardDatabase {
    private db: Database | null = null;
    private readonly dbPath = 'sqlite:clipboard_history.db';
    private isInitialized = false;

    async init() {
        if (this.isInitialized) return;

        try {
            this.db = await Database.load(this.dbPath);

            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS clipboard_entries
                (
                    id              INTEGER PRIMARY KEY AUTOINCREMENT,
                    content         TEXT    NOT NULL,
                    content_type    TEXT    NOT NULL,
                    preview         TEXT,
                    copy_count      INTEGER NOT NULL DEFAULT 1,
                    first_copied_at TEXT    NOT NULL,
                    last_copied_at  TEXT    NOT NULL,
                    is_favorite     BOOLEAN NOT NULL DEFAULT 0,
                    metadata        TEXT,
                    source_url      TEXT
                )
            `);

            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS settings
                (
                    key   TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
            `);

            this.isInitialized = true;
        } catch (err) {
            Logger.error('Failed to initialize database:', err);
            throw err;
        }
    }

    async getClipboardEntries({
        limit = 100,
        type,
        favoritesOnly = false,
        searchQuery
    }: {
        limit?: number,
        type?: ClipboardContentType,
        favoritesOnly?: boolean,
        searchQuery?: string
    } = {}): Promise<ClipboardEntry[]> {
        await this.init();
        if (!this.db) return [];

        const conditions = [];
        const params = [];
        let paramIndex = 1;

        if (type) {
            conditions.push(`content_type = $${paramIndex++}`);
            params.push(type);
        }

        if (favoritesOnly) {
            conditions.push('is_favorite = 1');
        }

        if (searchQuery?.trim()) {
            const trimmedQuery = searchQuery.trim();
            conditions.push(`(content LIKE $${paramIndex} OR preview LIKE $${paramIndex++})`);
            params.push(`%${trimmedQuery}%`);
        }

        const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

        params.push(limit);
        const query = `SELECT * FROM clipboard_entries${whereClause} ORDER BY last_copied_at DESC LIMIT $${paramIndex}`;

        return this.mapToClipboardEntry(await this.db.select(query, params));
    }

    async saveClipboardEntry(content: string, contentType: ClipboardContentType, preview?: string, metadata?: string, sourceUrl?: string): Promise<boolean> {
        await this.init();
        if (!this.db || !content) return false;

        const timestamp = new Date().toISOString();
        const normalizedContent = content.trim();

        const existingItem = await this.findExistingClipboardEntry(normalizedContent, contentType);

        if (existingItem) {
            return this.updateExistingClipboardEntry(existingItem, timestamp);
        } else {
            return this.insertNewClipboardEntry(normalizedContent, contentType, preview, timestamp, metadata, sourceUrl);
        }
    }

    async toggleFavorite(id: number): Promise<boolean> {
        await this.init();
        if (!this.db || !id) return false;

        const result = await this.db.execute(
            'UPDATE clipboard_entries SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = $1',
            [id]
        );

        return result.rowsAffected > 0;
    }

    async deleteClipboardEntry(id: number): Promise<boolean> {
        await this.init();
        if (!this.db || !id) return false;

        const result = await this.db.execute('DELETE FROM clipboard_entries WHERE id = $1', [id]);
        return result.rowsAffected > 0;
    }

    async clearAllEntries(keepFavorites: boolean = true): Promise<boolean> {
        await this.init();
        if (!this.db) return false;

        const result = await this.db.execute(`DELETE
                                              FROM clipboard_entries ${keepFavorites ? ' WHERE is_favorite = 0' : ''}`);
        return result.rowsAffected > 0;
    }

    private async findExistingClipboardEntry(content: string, contentType: ClipboardContentType): Promise<{
        id: number,
        copy_count: number
    } | null> {
        if (!this.db) return null;

        const entries = await this.db.select<{ id: number, copy_count: number }[]>(
            'SELECT id, copy_count FROM clipboard_entries WHERE content = $1 AND content_type = $2',
            [content, contentType]
        );

        return entries.length > 0 ? entries[0] : null;
    }

    private async updateExistingClipboardEntry(entry: {
        id: number,
        copy_count: number
    }, timestamp: string): Promise<boolean> {
        if (!this.db) return false;

        const result = await this.db.execute(
            'UPDATE clipboard_entries SET copy_count = $1, last_copied_at = $2 WHERE id = $3',
            [entry.copy_count + 1, timestamp, entry.id]
        );

        return result.rowsAffected > 0;
    }

    private async insertNewClipboardEntry(
        content: string,
        contentType: ClipboardContentType,
        preview: string | undefined,
        timestamp: string,
        metadata?: string,
        sourceUrl?: string
    ): Promise<boolean> {
        if (!this.db) return false;

        const result = await this.db.execute(
            `INSERT INTO clipboard_entries
             (content, content_type, preview, copy_count, first_copied_at, last_copied_at, metadata, source_url)
             VALUES ($1, $2, $3, 1, $4, $5, $6, $7)`,
            [content, contentType, preview, timestamp, timestamp, metadata, sourceUrl]
        );

        return result.rowsAffected > 0;
    }

    private mapToClipboardEntry(results: any[]): ClipboardEntry[] {
        return results.map(dbEntry => ({
            id: dbEntry.id,
            content: dbEntry.content,
            contentType: dbEntry.content_type as ClipboardContentType,
            preview: dbEntry.preview,
            copyCount: dbEntry.copy_count,
            firstCopiedAt: dbEntry.first_copied_at,
            lastCopiedAt: dbEntry.last_copied_at,
            isFavorite: Boolean(dbEntry.is_favorite),
            metadata: dbEntry.metadata,
            sourceUrl: dbEntry.source_url
        }));
    }

    async getSetting<T>(key: string, defaultValue: T): Promise<T> {
        await this.init();
        if (!this.db) return defaultValue;

        try {
            const result = await this.db.select<{ value: string }[]>(
                'SELECT value FROM settings WHERE key = $1',
                [key]
            );

            if (result.length === 0) return defaultValue;

            const value = result[0].value;

            if (typeof defaultValue === 'number') return Number(value) as T;
            if (typeof defaultValue === 'boolean') return (value === 'true') as T;
            if (typeof defaultValue === 'object') return JSON.parse(value) as T;

            return value as T;
        } catch (err) {
            Logger.error(`Failed to get setting: ${key}`, err);
            return defaultValue;
        }
    }

    async setSetting<T>(key: string, value: T): Promise<boolean> {
        await this.init();
        if (!this.db) return false;

        try {
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

            const result = await this.db.execute(
                `INSERT INTO settings (key, value)
                 VALUES ($1, $2)
                 ON CONFLICT(key) DO UPDATE SET value = $2`,
                [key, stringValue]
            );

            return result.rowsAffected > 0;
        } catch (err) {
            Logger.error(`Failed to set setting: ${key}`, err);
            return false;
        }
    }

    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
            this.isInitialized = false;
        }
    }
}

const clipboardDatabase = new ClipboardDatabase();
export default clipboardDatabase;