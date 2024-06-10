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
      const cursor = req.body?.cursor ?? null;
      const products = await client.request(`{
        products(first: 10, reverse: true, query: "status:active") {
          edges {
            cursor
            node {
              createdAt
              description
              featuredImage {
                altText
                height
                id
                originalSrc
                src
                transformedSrc
                url
                width
              }
              adminGraphqlApiId: id
              id
              resourcePublicationOnCurrentPublication {
                publication {
                  name
                  id
                }
                publishDate
                isPublished
              }
              images(first: 10) {
                edges {
                  node {
                    height
                    id
                    originalSrc
                    src
                    transformedSrc
                    url
                    width
                  }
                }
              }
              onlineStoreUrl
              options {
                id
                name
                values
              }
              productType
              publishedAt
              seo {
                description
                title
              }
              tags
              title
              totalInventory
              updatedAt
              variants (first: 10) {
                edges {
                  node {
                    id
                    admin_graphql_api_id: id
                    availableForSale
                    barcode
                    image {
                      height
                      id
                      originalSrc
                      src
                      url
                      transformedSrc
                      width
                    }
                    requiresShipping
                    selectedOptions {
                      name
                      value
                    }
                    sku
                    taxable
                    title
                    price
                    weight
                    weightUnit
                    inventoryQuantity
                    inventoryManagement
                    inventoryPolicy
                  }
                }
              }
              vendor
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }`);
      // const productsList = products?.data?.products?.edges.map((product) => product.node) || [];
      const productsList = products?.data?.products?.edges.map((product) => { 
       const node =  product.node;
       node.id = node.id.split("/").pop() || node.id;
       node.image = node.featuredImage;
       node.images = node.images.edges.map((image) => image.node);
       node.variants = node.variants.edges.map((variant) => {
        const vNode = variant.node;
        vNode.id = vNode.id.split("/").pop() || vNode.id;
        return vNode;
      });
       return node;
      }) || [];
      return res.status(200).send({ products: productsList });
    } catch (e) {
      console.error(`---> An error occured`, e);
      return res.status(400).send({ text: "Bad request" });
    }
};

export default withMiddleware("verifyRequest")(handler);
