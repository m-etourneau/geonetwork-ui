import type { Feature } from 'geojson'
import { DatasetHeaders, parseHeaders } from './headers'

export type DataItem = Feature

class FetchError {
  constructor(
    public message,
    public httpStatus = 0,
    public isCrossOriginOrNetworkRelated = false,
    public parsingFailed = false,
    public contentTypeError = false
  ) {}
  static http(code: number) {
    return new FetchError('Received HTTP error', code)
  }
  static corsOrNetwork(message: string) {
    return new FetchError(
      `Data could not be fetched (probably because of CORS limitations or a network error); error message is: ${message}`,
      0,
      true
    )
  }
  static parsingFailed(info: string) {
    return new FetchError(
      `The received file could not be parsed for the following reason: ${info}`,
      0,
      false,
      true
    )
  }
  static unsupportedType(mimeType: string) {
    return new FetchError(
      `The following content type is unsupported: ${mimeType}`,
      0,
      false,
      false,
      true
    )
  }
  static unknownType() {
    return new FetchError(
      'The content type could not be inferred and was not hinted, abandoning',
      0,
      false,
      false,
      true
    )
  }
}

/**
 * This fetches the full dataset at the given URL and parses it according to its mime type.
 * All items in the dataset are converted to GeoJSON features, even if they do not bear any spatial geometry.
 */
export function readDataset(url: string): Promise<DataItem[]> {
  return fetch(url)
    .catch((error) => {
      throw FetchError.corsOrNetwork(error.message)
    })
    .then(async (response) => {
      if (!response.ok) {
        throw FetchError.http(response.status)
      }
      const fileInfo = parseHeaders(response.headers)
      const rawData = await response.text()

      if (!('supportedType' in fileInfo)) {
        if ('mimeType' in fileInfo)
          throw FetchError.unsupportedType(fileInfo.mimeType)
        else throw FetchError.unknownType()
      }

      // TODO: actually parse text
      try {
        switch (fileInfo.supportedType) {
          case 'csv':
            break
          case 'json':
            break
          case 'geojson':
            break
          case 'excel':
            break
        }
      } catch (e) {
        throw FetchError.parsingFailed(e.message)
      }

      return []
    })
}

/**
 * This fetches only the header of the dataset at the given URL, giving info on size, mime-type and last update if available.
 */
export function readDatasetHeaders(url: string): Promise<DatasetHeaders> {
  return fetch(url).then((response) => parseHeaders(response.headers))
}
