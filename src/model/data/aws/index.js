// src/model/data/aws/index.js

// XXX: temporary use of memory-db until we add DynamoDB
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const MemoryDB = require('../memory/memory-db');
const logger = require('../../../logger');
const s3Client = require('./s3Client');

// Create two in-memory databases: one for fragment metadata and the other for raw data
const metadata = new MemoryDB();

// Write a fragment's metadata to memory db. Returns a Promise
function writeFragment(fragment) {
  return metadata.put(fragment.ownerId, fragment.id, fragment);
}

// Read a fragment's metadata from memory db. Returns a Promise
function readFragment(ownerId, id) {
  return metadata.get(ownerId, id);
}

// Write a fragment's data to an S3 Object in a Bucket
async function writeFragmentData(ownerId, id, data) {
  // create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // our key will be a mix of the ownerID and fragmentId, written as a path
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  // create a PUT Object command to send to S3
  const command = new PutObjectCommand(params);

  try {
    // user our client to send the command
    await s3Client.send(command);
  } catch (err) {
    // if anything goes wrong, log info so we can debug
    const { Bucket, Key } = params;

    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Convert a stream of data into a Buffer, by collecting
// chunks of data until finished, then assembling them together.
// We wrap the whole thing in a Promise so it's easier to consume.
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    // array to collect the data stream as it's coming in
    const chunks = [];

    // Streams have events that we can listen for and run
    // code.  We need to know when new `data` is available,
    // if there's an `error`, and when we're at the `end`
    // of the stream.

    // there is data? add this chunk to our chunks list
    stream.on('data', (chunk) => chunks.push(chunk));
    // there is error? reject the promise
    stream.on('error', reject);
    // stream is done? resolve with a new Buffer of chunks
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Read a fragment's data from S3. Returns (Promise<Buffer>)
async function readFragmentData(ownerId, id) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(command);
    // Convert the ReadableStream to a Buffer
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
async function listFragments(ownerId, expand = false) {
  const fragments = await metadata.query(ownerId);

  // If we don't get anything back, or are supposed to give expanded fragments, return
  if (expand || !fragments) {
    return fragments;
  }

  // Otherwise, map to only send back the ids
  return fragments.map((fragment) => fragment.id);
}

// Delete a fragment's metadata and data from memory db. Returns a Promise
async function deleteFragment(ownerId, id) {
  // Delete metadata
  metadata.del(ownerId, id);

  // create the DELETE API params from our details to delete fragment data from S3
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  // create a DELETE Object command to send to S3
  const command = new DeleteObjectCommand(params);

  try {
    // delete the object from the Amazon S3 bucket
    return Promise.all([metadata.del(ownerId, id), s3Client.send(command)]);
  } catch (err) {
    // if anything goes wrong
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error deleting fragment from S3');
    throw new Error('unable to delete the fragment');
  }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;