import { isIE11 } from './resolutionHelper';
import axios from 'axios';

/**
 * API calling module
 * @param  {Object} httpObj          [HTTP confirguration object]
 * @param  {Function} successHandler [Success Callback]
 * @param  {Function} errorHandler   [Failure Callback]
 * @return {Objet Callback}          [Return Object Callback]
 */
export default function requestData(httpObj, successHandler, errorHandler, isJSON = true) {
    const hostName = process.env.REACT_APP_SERVER_HOST;
    const port = process.env.REACT_APP_SERVER_PORT;
    const serverUrl = `${hostName}:${port}/`;

    let paramsInfo = httpObj.params;

    if (isIE11()) {
        paramsInfo = {
            ...{
                timeFresher: new Date().getTime(),
            },
            ...httpObj.params,
        };
    }

    let httpData = JSON.stringify(httpObj.data);

    if (!isJSON) {
        httpData = httpObj.data;
    }
    return axios.request({

        //url: httpObj.url,
        //baseURL: httpObj.baseURL || serverUrl,
        url: httpObj.url + '.json',

        method: httpObj.method || 'post',
        headers: {
            ...{
                'Content-Type': 'application/json',
            },
            ...httpObj.headers,
        },
        params: paramsInfo,
        timeout: 400000,
        data: httpData,
    }).then(successHandler, errorHandler);
}
