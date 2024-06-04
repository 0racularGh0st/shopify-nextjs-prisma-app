import withMiddleware from "@/utils/middleware/withMiddleware.js";
import { handleResponse } from "@/common/utils/network/responseHandler";
import { convertObjectFieldNamesToCamelCase } from "@/common/utils/helpers";
import { signInUrl } from "@/common/utils/network/endpoints";
/**
 * @param {import("next").NextApiRequest} req - The HTTP request object.
 * @param {import("next").NextApiResponse} res - The HTTP response object.
 */
const handler = async (req, res) => {
    const data = req.body;
    try {
      const apiRes = await fetch(signInUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      const {
        code, response,
      } = await handleResponse(apiRes);
      const user = response;
      if (code === 200 && user) {
        return res.status(200).send({ user: convertObjectFieldNamesToCamelCase(user.data)});
      }
      return res.status(400).send({ text: "Bad request" });

    } catch (e) {
      console.error(`---> An error occured`, e);
      return res.status(400).send({ text: "Bad request" });
    }
};

export default withMiddleware("verifyRequest")(handler);
