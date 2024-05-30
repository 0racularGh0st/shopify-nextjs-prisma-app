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
      const products = await client.request(`query {
        products(first: 10, reverse: true, query: "status:active") {
          edges {
            node {
              id
              title
              handle
              descriptionHtml
              status
              images(first: 1) {
                edges {
                  node {
                    id
                    src
                    altText
                  }
                }
              }
              variants(first: 250) {
                edges {
                node {
                    id
                    title
                    inventoryQuantity
                 }
                }
             }
              resourcePublicationOnCurrentPublication {
                publication {
                  name
                  id
                }
                publishDate
                isPublished
              }
            }
          }
        }
      }`);
      const productsList = products?.data?.products?.edges.map((product) => product.node) || [];
      return res.status(200).send({ products: productsList });
    } catch (e) {
      console.error(`---> An error occured`, e);
      return res.status(400).send({ text: "Bad request" });
    }
};

export default withMiddleware("verifyRequest")(handler);
