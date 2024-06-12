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
      console.log("Req body->>>", req.body);
      const productId = req.body?.productId;
      console.log("productId->>>", productId);
      const response = await client.request(`mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
            id: productId,
            input: {
            publicationId: process.env.NEXT_PUBLIC_PUBLICATION_ID,
            }
        }
      }
    );
   
    console.log("Response->>>", JSON.stringify(response));
      if (response?.publishablePublish?.userErrors?.length > 0) {
        return res.status(400).json({ errors: response.publishablePublish.userErrors });
      }
      return res.status(200).send({ success: true });
    } catch (e) {
      console.error(`---> An error occured`, e);
      return res.status(400).send({ text: "Bad request", success: false });
    }
};

export default withMiddleware("verifyRequest")(handler);
