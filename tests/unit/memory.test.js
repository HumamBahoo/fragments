const {
  listFragments,
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
} = require('../../src/model/data/memory');

describe('fragment database related calls', () => {
  test('readFragment() should return nothing', async () => {
    const result = await readFragment('a', 'b');
    expect(result).toBe(undefined);
  });

  test('writeFragment() should write and return nothing', async () => {
    const result = await writeFragment({ ownerId: 'a', id: 'b', value: 123 });
    expect(result).toBe(undefined);
  });

  test('readFragment() should return a fragment written by writeFragment()', async () => {
    const fragment = { ownerId: 'a', id: 'b', value: 123 };
    await writeFragment(fragment);

    const result = await readFragment('a', 'b');
    expect(result).toEqual(fragment);
  });

  test('readFragmentData() should return nothing', async () => {
    const result = await readFragmentData('c', 'd');
    expect(result).toBe(undefined);
  });

  test('writeFragmentData() should return nothing', async () => {
    const data = Buffer.from([1, 2, 3]);
    const result = await writeFragmentData('a', 'b', data);
    expect(result).toBe(undefined);
  });

  test('readFragmentData() returns a fragment data written by writeFragmentData()', async () => {
    const data = Buffer.from([1, 2, 3]);
    await writeFragmentData('a', 'b', data);

    const result = await readFragmentData('a', 'b');
    expect(result).toEqual(data);
  });

  test('listFragments() should return a list of fragment ids', async () => {
    await writeFragment({ ownerId: 'a1', id: 'b1', value: 123 });
    await writeFragment({ ownerId: 'a1', id: 'b2', value: 123 });
    await writeFragment({ ownerId: 'a1', id: 'b3', value: 123 });

    const results = await listFragments('a1');

    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual(['b1', 'b2', 'b3']);
  });

  test('deleteFragment() should delete value written by writeFragment()', async () => {
    const fragment = { ownerId: 'a', id: 'b', value: 123 };
    await writeFragment(fragment);

    expect(await readFragment('a', 'b')).toEqual(fragment);
    await deleteFragment(fragment.ownerId, fragment.id);
    expect(await readFragment('a', 'b')).toEqual(undefined);
  });

  test('deleteFragment() should throw when provided keys do not exist', async () => {
    expect(() => deleteFragment('x', 'y')).rejects.toThrow();
  });

  test('listFragments() with expand set to true should return an empty array', async () => {
    const results = await listFragments('not-an-id', true);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});
