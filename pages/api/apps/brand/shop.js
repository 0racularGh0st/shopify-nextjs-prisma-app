import clientProvider from "@/utils/clientProvider";
import withMiddleware from "@/utils/middleware/withMiddleware.js";

/**
 * @param {import("next").NextApiRequest} req - The HTTP request object.
 * @param {import("next").NextApiResponse} res - The HTTP response object.
 */
const handler = async (req, res) => {
    try {
      const { client } = await clientProvider.online.graphqlClient({
        req,
        res,
      });
      const shop = await client.request(`{
        shop {
          currencyCode
        }
      }`);
      return res.status(200).send({ currencyCode: shop?.data?.shop.currencyCode });
    } catch (e) {
      console.error(`---> An error occured`, e);
      return res.status(400).send({ text: "Bad request" });
    }
};

export default withMiddleware("verifyRequest")(handler);
