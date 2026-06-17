const fs = require('fs');
const path = require('path');

class FileStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.files = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.files = JSON.parse(data);
      }
    } catch {
      this.files = [];
    }
  }

  save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.files, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Failed to save file list:', err);
      return false;
    }
  }

  _normalize(p) {
    return path.normalize(p || '').toLowerCase();
  }

  addFile(filePath, fileName) {
    if (!filePath || !fileName) return;
    const normalized = this._normalize(filePath);
    const existing = this.files.findIndex((f) => this._normalize(f.path) === normalized);
    if (existing >= 0) {
      this.files.splice(existing, 1);
    }
    this.files.unshift({
      path: filePath,
      name: fileName,
      openedAt: new Date().toISOString(),
    });
    if (this.files.length > 50) {
      this.files = this.files.slice(0, 50);
    }
    this.save();
  }

  removeFile(filePath) {
    if (!filePath) return;
    const normalized = this._normalize(filePath);
    this.files = this.files.filter((f) => this._normalize(f.path) !== normalized);
    this.save();
  }

  getFiles() {
    return this.files;
  }
}

module.exports = { FileStore };
