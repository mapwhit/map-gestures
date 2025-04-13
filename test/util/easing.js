import test from 'node:test';
import { bezier } from '../../lib/util/easing.js';

test('easing', async t => {
  await t.test('bezier', t => {
    const curve = bezier(0, 0, 0.25, 1);
    t.assert.ok(curve instanceof Function, 'returns a function');
    t.assert.equal(curve(0), 0);
    t.assert.equal(curve(1), 1);
    t.assert.equal(curve(0.5), 0.8230854638965502);
  });
});
