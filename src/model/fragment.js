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
      throw new Error('missing parameter: ownerId');
    }
    if (type == undefined) {
      throw new Error('missing parameter: type');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error('invalid parameter: type datatype is not supported');
    }
    if (size < 0) {
      throw new Error('parameter size cannot be negative');
    }
    if (typeof size != 'number') {
      throw new Error('invalid parameter: size datatype must be a number');
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = new Date().toISOString() || created;
    this.updated = new Date().toISOString() || updated;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const res = await listFragments(ownerId, expand);

    if (!res) {
      throw new Error(`there are no fragments with ownerId:${ownerId} available in db`);
    }

    return Promise.resolve(res);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const res = await readFragment(ownerId, id);

    if (!res) {
      throw new Error(`no fragment with ownerId:${ownerId} and id:${id} is found in db`);
    }

    return Promise.resolve(res);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    try {
      await deleteFragment(ownerId, id);
    } catch (err) {
      throw new Error(err);
    }
    return Promise.resolve();
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  async save() {
    this.updated = new Date().toISOString();

    try {
      await writeFragment(this);
    } catch (err) {
      throw new Error(err);
    }

    return Promise.resolve();
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    const res = await readFragmentData(this.ownerId, this.id);

    if (!res) {
      throw new Error(`fragment id:${this.id} is not found in db`);
    }

    return Promise.resolve(res);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    this.updated = new Date().toISOString();
    this.size = data.byteLength;

    try {
      await writeFragmentData(this.ownerId, this.id, data);
    } catch (err) {
      throw new Error(err);
    }

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
    let supportedTypesList = ['text/plain'];
    const res = contentType.parse(value);
    return supportedTypesList.includes(res.type);
  }
}

module.exports.Fragment = Fragment;
