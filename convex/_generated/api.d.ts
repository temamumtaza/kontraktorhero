/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminActions from "../adminActions.js";
import type * as checkout from "../checkout.js";
import type * as checkoutActions from "../checkoutActions.js";
import type * as http from "../http.js";
import type * as invoices from "../invoices.js";
import type * as loginAction from "../loginAction.js";
import type * as products from "../products.js";
import type * as promos from "../promos.js";
import type * as seed from "../seed.js";
import type * as upgrade from "../upgrade.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminActions: typeof adminActions;
  checkout: typeof checkout;
  checkoutActions: typeof checkoutActions;
  http: typeof http;
  invoices: typeof invoices;
  loginAction: typeof loginAction;
  products: typeof products;
  promos: typeof promos;
  seed: typeof seed;
  upgrade: typeof upgrade;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
