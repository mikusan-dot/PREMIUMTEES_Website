import { getFirestore } from '../config/firebase.js';

const stores = {};

// In-memory dev store (DEV_MODE only). Production uses Firestore.
class DevStore {
  constructor(name) {
    this.name = name;
    this.docs = new Map();
    this.id = 0;
    stores[name] = this;
  }

  _id() { return `${this.name}_${++this.id}_${Date.now()}`; }

  async add(data) {
    const id = this._id();
    const doc = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.docs.set(id, doc);
    return { id };
  }

  async get(id) {
    const doc = this.docs.get(id);
    return doc ? { exists: true, data: () => doc } : { exists: false, data: () => null };
  }

  async set(id, data) {
    const doc = { ...this.docs.get(id), ...data, id, updatedAt: new Date().toISOString() };
    this.docs.set(id, doc);
    return { id };
  }

  async delete(id) {
    this.docs.delete(id);
  }

  async query(filterFn, opts = {}) {
    let results = Array.from(this.docs.values()).filter(filterFn);
    if (opts.orderBy) {
      const dir = opts.orderBy === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        const av = a[opts.field] || 0;
        const bv = b[opts.field] || 0;
        return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
      });
    }
    if (opts.limit) results = results.slice(0, opts.limit);
    if (opts.offset) results = results.slice(opts.offset);
    return results.map((d) => ({ exists: true, data: () => d, id: d.id }));
  }

  async collection(name) {
    return new DevStore(name);
  }

  doc(id) {
    return { get: () => this.get(id), set: (d) => this.set(id, d), delete: () => this.delete(id), collection: () => new DevStore(`${this.name}/${id}`) };
  }
}

export const db = {
  collection(name) {
    if (process.env.DEV_MODE === 'true') {
      if (!stores[name]) new DevStore(name);
      return stores[name];
    }
    const firestore = getFirestore();
    return firestore.collection(name);
  },
  runTransaction: async (fn) => {
    if (process.env.DEV_MODE === 'true') {
      return fn({
        get: async (ref) => ref.get(),
        set: (ref, data) => ref.set(data),
        update: (ref, data) => ref.set(data),
        create: (ref, data) => ref.set(data),
        delete: (ref) => ref.delete(),
      });
    }
    const firestore = getFirestore();
    return firestore.runTransaction(fn);
  },
};
