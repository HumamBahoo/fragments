// src/model/fragment.js

// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');

// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (ownerId == undefined) {
      throw new Error('ownerId is missing');
    } else {
      this.ownerId = ownerId;
    }

    if (type == undefined) {
      throw new Error('type is missing');
    } else if (Fragment.isSupportedType(type)) {
      this.type = type;
    } else {
      throw new Error(`invalid type: ${type}`);
    }

    if (typeof size != 'number' || size < 0) {
      throw new Error(`invalid size: ${size}`);
    } else {
      this.size = size;
    }

    if (id == undefined) {
      this.id = randomUUID();
    } else {
      this.id = id;
    }

    this.created = new Date().toISOString();
    this.updated = new Date().toISOString();
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const result = await listFragments(ownerId, expand);
    return Promise.resolve(result);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const result = await readFragment(ownerId, id);

    if (!result) {
      throw new Error(`Fragment with id:${id} not found in db`);
    }

    return Promise.resolve(result);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    await deleteFragment(ownerId, id);
    return Promise.resolve();
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);

    return Promise.resolve();
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    const result = await readFragmentData(this.ownerId, this.id);

    if (!result) {
      throw new Error(`fragment with id: ${this.id} not found in db`);
    }

    return Promise.resolve(result);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    this.size = data.byteLength;
    this.updated = new Date().toISOString();

    await writeFragmentData(this.ownerId, this.id, data);

    return Promise.resolve();
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return [this.mimeType];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // array of supported types
    let validTypes = ['text/plain'];

    const result = contentType.parse(value);
    return validTypes.includes(result.type);
  }
}

module.exports.Fragment = Fragment;
