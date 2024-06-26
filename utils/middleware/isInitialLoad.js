import { RequestedTokenType } from "@shopify/shopify-api";
import sessionHandler from "../sessionHandler";
import shopify from "../shopify";
import freshInstall from "../freshInstall";
import prisma from "../prisma";

/**
 * @async
 * @param {{
 *   params: { [key: string]: string | undefined },
 *   req: import('http').IncomingMessage,
 *   res: import('http').ServerResponse,
 *   query: { [key: string]: string | string[] },
 *   preview?: boolean,
 *   previewData?: any,
 *   resolvedUrl: string,
 *   locale?: string,
 *   locales?: string[],
 *   defaultLocale?: string
 * }} context
 * @returns {Promise<{props: { [key: string]: any } | undefined}>} Object with props to be passed to the page component.
 */
const isInitialLoad = async (context) => {
  try {
    const shop = context.query.shop;
    const idToken = context.query.id_token;

    //Initial Load
    if (idToken && shop) {
      const { session: offlineSession } = await shopify.auth.tokenExchange({
        sessionToken: idToken,
        shop,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      });

      const { session: onlineSession } = await shopify.auth.tokenExchange({
        sessionToken: idToken,
        shop,
        requestedTokenType: RequestedTokenType.OnlineAccessToken,
      });

      sessionHandler.storeSession(offlineSession);
      sessionHandler.storeSession(onlineSession);

      const webhookRegisterResponse = await shopify.webhooks.register({
        session: offlineSession,
      });

      const isFreshInstall = await prisma.shopify_stores.findFirst({
        where: {
          shop: onlineSession.shop,
        },
      });

      if (!isFreshInstall || isFreshInstall?.is_active === false) {
        // !isFreshInstall -> New Install
        // isFreshInstall?.is_active === false -> Reinstall
        await freshInstall({ shop: onlineSession.shop });
      }

      console.dir(webhookRegisterResponse, { depth: null });
    } else {
      // The user has visited the page again.
      // We know this because we're not preserving any url params and idToken doesn't exist here
    }
    return {
      props: {
        data: "ok",
      },
    };
  } catch (e) {
    if (e.message.startsWith("InvalidJwtError")) {
      console.error(
        "JWT Error - happens in dev mode and can be safely ignored, even in prod."
      );
    } else {
      console.error(`---> An error occured at isInitialLoad: ${e.message}`, e);
      return {
        props: {
          serverError: true,
        },
      };
    }
    return {
      props: {
        data: "ok",
      },
    };
  }
};

export default isInitialLoad;
