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
  export const convertObjectFieldNamesFromCamelCaseToSnakeCase = (obj) => {
    if (obj === null) {
      return null;
    }
    if (typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => convertObjectFieldNamesFromCamelCaseToSnakeCase(item));
    }
    return Object.keys(obj).reduce((acc, key) => {
      const snakeCaseKey = key.replace(/([A-Z])/g, (group) => `_${group.toLowerCase()}`);
      // eslint-disable-next-line no-param-reassign
      acc[snakeCaseKey] = convertObjectFieldNamesFromCamelCaseToSnakeCase(obj[key]);
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
  export const isFutureDate = (date) => {
    const givenDate = new Date(date);
    const currentDate = new Date();
    return givenDate > currentDate;
  }

  export const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) {
      return true; // Same object or primitive value
    }
  
    if (obj1 == null || obj2 == null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false; // One of the objects is null or not an object
    }
  
    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
      return false; // One is an array, the other is not
    }
  
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) {
      return false; // Different number of keys
    }
  
    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false; // Keys are different or values are not deeply equal
      }
    }
  
    return true; // All keys and values are deeply equal
  }
  
  export const arraysEqual = (arr1, arr2) => {
    if (!arr1 || !arr2) {
      return false; // One of the arrays is null or undefined
    }
    if (arr1.length !== arr2.length) {
      return false; // Arrays have different lengths
    }
  
    for (let i = 0; i < arr1.length; i++) {
      if (!deepEqual(arr1[i], arr2[i])) {
        return false; // Arrays have different elements
      }
    }
  
    return true; // Arrays are equal
  }