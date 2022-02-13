/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { IEncodeContext } from '../types.js';

export class EncodeError extends Error {
  constructor(message: string, readonly offset: number ) {
    super(message);
  }
}

export class EncodeWarning extends Error {
  constructor(message: string, readonly offset: number) {
    super(message);
  }
}

/**
 * Handles a warning, throwing in strict mode or adding to the warnings array otherwise.
 * @param ctx The decode context.
 * @param warning The warning to handle.
 */
export function handleWarning(ctx: Pick<IEncodeContext, 'options' | 'warnings'>, warning: EncodeWarning) {
  if (ctx.options.strictMode) {
    throw warning;
  }
  ctx.warnings.push(warning);
}
