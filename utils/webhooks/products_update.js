/**
* Replace TOPIC_NAME with a Webhook Topic to enable autocomplete
* @typedef { import("@/_developer/types/2023-10/webhooks.js").PRODUCTS_UPDATE } webhookTopic
*/

const productsUpdateHandler = async (topic, shop, webhookRequestBody, webhookId, apiVersion) => {
 try {
  /** @type {webhookTopic} */
  const webhookBody = JSON.parse(webhookRequestBody);
  console.log("PRODUCTS_UPDATE webhookBody ->>")
  console.log(JSON.stringify(webhookBody, null, 2))
 } catch (e) {
  console.error(e);
 }
};

export default productsUpdateHandler;