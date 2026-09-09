import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import path from "path";
import fs from "fs";
import { DatabaseSync } from "node:sqlite";
//#region src/services/db/documentDb.ts
var documentDb_exports = /* @__PURE__ */ __exportAll({
	getAllDocuments: () => getAllDocuments,
	getDocumentById: () => getDocumentById,
	getDocumentByName: () => getDocumentByName,
	getDocumentByPath: () => getDocumentByPath,
	insertDocument: () => insertDocument
});
var dbInstance = null;
function getDb() {
	if (dbInstance) return dbInstance;
	const dataDir = path.resolve(process.cwd(), "sovereign-ai-workbench", "data");
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	const dbPath = path.join(dataDir, "sentinel_documents.db");
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
		console.error("[DATABASE] Failed to initialize SQLite database with node:sqlite:", err);
		return null;
	}
}
function insertDocument(doc) {
	const db = getDb();
	if (!db) return false;
	try {
		db.prepare(`
      INSERT OR REPLACE INTO documents (
        id, workspace_id, original_filename, stored_filename, relative_path,
        mime_type, file_size, sha256, uploaded_at, updated_at, extracted_text, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(doc.id, doc.workspace_id || "user_workspace", doc.original_filename, doc.stored_filename, doc.relative_path, doc.mime_type || "application/octet-stream", doc.file_size || 0, doc.sha256 || "", doc.uploaded_at, doc.updated_at, doc.extracted_text || "", doc.status || "ready");
		return true;
	} catch (err) {
		console.error("[DATABASE] Error inserting document into SQLite:", err);
		return false;
	}
}
function getAllDocuments() {
	const db = getDb();
	if (!db) return [];
	try {
		return db.prepare("SELECT * FROM documents ORDER BY uploaded_at DESC").all();
	} catch (err) {
		console.error("[DATABASE] Error querying documents from SQLite:", err);
		return [];
	}
}
function getDocumentById(id) {
	const db = getDb();
	if (!db) return null;
	try {
		return db.prepare("SELECT * FROM documents WHERE id = ?").get(id) || null;
	} catch (err) {
		console.error("[DATABASE] Error finding document by ID:", err);
		return null;
	}
}
function getDocumentByName(filename) {
	const db = getDb();
	if (!db) return null;
	try {
		return db.prepare("SELECT * FROM documents WHERE original_filename = ? OR stored_filename = ? LIMIT 1").get(filename, filename) || null;
	} catch (err) {
		console.error("[DATABASE] Error finding document by filename:", err);
		return null;
	}
}
function getDocumentByPath(relPath) {
	const db = getDb();
	if (!db) return null;
	try {
		const normalized = relPath.replace(/\\/g, "/");
		return db.prepare("SELECT * FROM documents WHERE relative_path = ? OR relative_path = ? LIMIT 1").get(normalized, `Uploads/${path.basename(normalized)}`) || null;
	} catch (err) {
		console.error("[DATABASE] Error finding document by path:", err);
		return null;
	}
}
//#endregion
export { getAllDocuments as n, getDocumentById as r, documentDb_exports as t };
