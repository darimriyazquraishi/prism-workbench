import path from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

export interface DocumentRecord {
  id: string;
  workspace_id?: string;
  original_filename: string;
  stored_filename: string;
  relative_path: string;
  mime_type?: string;
  file_size?: number;
  sha256?: string;
  uploaded_at: string;
  updated_at: string;
  extracted_text?: string;
  status: 'ready' | 'processing' | 'error' | 'indexed';
}

let dbInstance: any = null;

function getDb() {
  if (dbInstance) return dbInstance;

  const dataDir = path.resolve(process.cwd(), 'sovereign-ai-workbench', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'sentinel_documents.db');

  try {
    dbInstance = new DatabaseSync(dbPath);

    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        workspace_id TEXT,
        original_filename TEXT NOT NULL,
        stored_filename TEXT NOT NULL,
        relative_path TEXT NOT NULL,
        mime_type TEXT,
        file_size INTEGER,
        sha256 TEXT,
        uploaded_at TEXT,
        updated_at TEXT,
        extracted_text TEXT,
        status TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_doc_name ON documents(original_filename);
      CREATE INDEX IF NOT EXISTS idx_doc_path ON documents(relative_path);
    `);

    return dbInstance;
  } catch (err) {
    console.error('[DATABASE] Failed to initialize SQLite database with node:sqlite:', err);
    return null;
  }
}

export function insertDocument(doc: DocumentRecord): boolean {
  const db = getDb();
  if (!db) return false;

  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO documents (
        id, workspace_id, original_filename, stored_filename, relative_path,
        mime_type, file_size, sha256, uploaded_at, updated_at, extracted_text, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      doc.id,
      doc.workspace_id || 'user_workspace',
      doc.original_filename,
      doc.stored_filename,
      doc.relative_path,
      doc.mime_type || 'application/octet-stream',
      doc.file_size || 0,
      doc.sha256 || '',
      doc.uploaded_at,
      doc.updated_at,
      doc.extracted_text || '',
      doc.status || 'ready'
    );

    return true;
  } catch (err) {
    console.error('[DATABASE] Error inserting document into SQLite:', err);
    return false;
  }
}

export function getAllDocuments(): DocumentRecord[] {
  const db = getDb();
  if (!db) return [];

  try {
    const stmt = db.prepare('SELECT * FROM documents ORDER BY uploaded_at DESC');
    return stmt.all() as DocumentRecord[];
  } catch (err) {
    console.error('[DATABASE] Error querying documents from SQLite:', err);
    return [];
  }
}

export function getDocumentById(id: string): DocumentRecord | null {
  const db = getDb();
  if (!db) return null;

  try {
    const stmt = db.prepare('SELECT * FROM documents WHERE id = ?');
    const result = stmt.get(id);
    return (result as DocumentRecord) || null;
  } catch (err) {
    console.error('[DATABASE] Error finding document by ID:', err);
    return null;
  }
}

export function getDocumentByName(filename: string): DocumentRecord | null {
  const db = getDb();
  if (!db) return null;

  try {
    const stmt = db.prepare('SELECT * FROM documents WHERE original_filename = ? OR stored_filename = ? LIMIT 1');
    const result = stmt.get(filename, filename);
    return (result as DocumentRecord) || null;
  } catch (err) {
    console.error('[DATABASE] Error finding document by filename:', err);
    return null;
  }
}

export function getDocumentByPath(relPath: string): DocumentRecord | null {
  const db = getDb();
  if (!db) return null;

  try {
    const normalized = relPath.replace(/\\/g, '/');
    const stmt = db.prepare('SELECT * FROM documents WHERE relative_path = ? OR relative_path = ? LIMIT 1');
    const result = stmt.get(normalized, `Uploads/${path.basename(normalized)}`);
    return (result as DocumentRecord) || null;
  } catch (err) {
    console.error('[DATABASE] Error finding document by path:', err);
    return null;
  }
}

export function deleteDocument(idOrFilename: string): boolean {
  const db = getDb();
  if (!db) return false;

  try {
    const stmt = db.prepare('DELETE FROM documents WHERE id = ? OR original_filename = ? OR stored_filename = ?');
    stmt.run(idOrFilename, idOrFilename, idOrFilename);
    return true;
  } catch (err) {
    console.error('[DATABASE] Error deleting document:', err);
    return false;
  }
}
