/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as assert from 'assert';

import { parse } from 'mfm-js';
import { extractMentions } from '@/misc/extract-mentions.js';

describe('Extract mentions', () => {
	test('simple', () => {
		const ast = parse('@foo @bar @baz');
		const mentions = extractMentions(ast);
		assert.deepStrictEqual(mentions, [{
			username: 'foo',
			acct: '@foo',
			host: null,
		}, {
			username: 'bar',
			acct: '@bar',
			host: null,
		}, {
			username: 'baz',
			acct: '@baz',
			host: null,
		}]);
	});

	test('nested', () => {
		const ast = parse('@foo **@bar** @baz');
		const mentions = extractMentions(ast);
		assert.deepStrictEqual(mentions, [{
			username: 'foo',
			acct: '@foo',
			host: null,
		}, {
			username: 'bar',
			acct: '@bar',
			host: null,
		}, {
			username: 'baz',
			acct: '@baz',
			host: null,
		}]);
	});
});
