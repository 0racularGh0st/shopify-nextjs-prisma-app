const RESPONSE_BODY_TYPE = {
    JSON : 'json',
    TEXT : 'text',
  }
export const convertObjectFieldNamesToCamelCase = (obj) => {
    if (obj === null) {
      return null;
    }
    if (typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => convertObjectFieldNamesToCamelCase(item));
    }
    return Object.keys(obj).reduce((acc, key) => {
      let camelCaseKey = key.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
      camelCaseKey = camelCaseKey.replaceAll('_', '');
      // eslint-disable-next-line no-param-reassign
      acc[camelCaseKey] = convertObjectFieldNamesToCamelCase(obj[key]);
      return acc;
    }, {});
  };

export async function handleResponse (response) {
    if (response.status >= 400) {
      await handleResponseError(response);
    }
    const responseDataType = response.headers.get('Content-Type')?.includes('application/json') ? RESPONSE_BODY_TYPE.JSON : RESPONSE_BODY_TYPE.TEXT;
    const responseReturnData = !!response?.body && responseDataType === RESPONSE_BODY_TYPE.JSON ? await response.json() : await response.text();
  
    return {
      code: response.status,
      response: responseReturnData,
    };
  }

  export async function handleResponseError (response) {
    const responseDataType = response?.headers.get('Content-Type')?.includes('application/json') ? RESPONSE_BODY_TYPE.JSON : RESPONSE_BODY_TYPE.TEXT;
    const body = responseDataType === RESPONSE_BODY_TYPE.JSON ? await response.json() : await response.text();
    const errorObject = {
      statusCode: response?.status,
      statusText: body.message,
      url: response?.url,
      body,
    };
  
    throw new Error(errorObject.statusText, { cause: errorObject });
  }