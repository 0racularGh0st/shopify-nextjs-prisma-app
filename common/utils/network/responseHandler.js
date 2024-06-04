
const RESPONSE_BODY_TYPE = {
  JSON : 'json',
  TEXT : 'text',
}

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
