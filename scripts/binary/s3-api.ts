const debug = require("debug")("cypress:binary")
import la from 'lazy-ass'
import is from 'check-more-types'
import S3 from 'aws-sdk/clients/s3'
import {prop} from 'ramda'

/**
 * Utility object with methods that deal with S3.
 * Useful for testing our code that calls S3 methods.
 */
export const s3helpers = {
  makeS3 (aws) {
    la(is.unemptyString(aws.key), 'missing aws key')
    la(is.unemptyString(aws.secret), 'missing aws secret')

    return new S3({
      accessKeyId: aws.key,
      secretAccessKey: aws.secret
    })
  },

  verifyZipFileExists (zipFile: string, bucket: string, s3: S3): Promise<null> {
    debug('checking S3 file %s', zipFile)
    debug('bucket %s', bucket)

    return new Promise((resolve, reject) => {
      s3.headObject({
        Bucket: bucket,
        Key: zipFile
      }, (err, data) => {
        if (err) {
          debug('error getting object %s', zipFile)
          debug(err)

          return reject(err)
        }
        debug('s3 data for %s', zipFile)
        debug(data)
        resolve()
      })
    })
  },

  /**
   * Returns list of prefixes in a given folder
   */
  listS3Objects (uploadDir: string, bucket: string, s3: S3): Promise<string[]> {
    la(is.unemptyString(uploadDir), 'invalid upload dir', uploadDir)

    return new Promise((resolve, reject) => {
      const prefix = uploadDir + '/'
      s3.listObjectsV2({
        Bucket: bucket,
        Prefix: prefix,
        Delimiter: '/'
      }, (err, result) => {
        if (err) {
          return reject(err)
        }

        debug('AWS result in %s %s', bucket, prefix)
        debug('%o', result)

        resolve(result.CommonPrefixes.map(prop('Prefix')))
      })
    })
  },

  copyS3 (sourceKey: string, destinationKey: string, bucket: string, s3: S3): Promise<S3.CopyObjectOutput> {
    return new Promise((resole, reject) => {
      debug('copying %s in bucket %s to %s', sourceKey, bucket, destinationKey)

      s3.copyObject({
        Bucket: bucket,
        CopySource: bucket + '/' + sourceKey,
        Key: destinationKey
      }, (err, data) => {
        if (err) {
          return reject(err)
        }

        debug('result of copying')
        debug('%o', data)
      })
    })
  },

  /**
   * Returns user metadata for the given S3 object.
   * Note: on S3 when adding user metadata, each key is prefixed with "x-amz-meta-"
   * but the returned object has these prefixes stripped. Thus if we set
   * a single "x-amz-meta-user: gleb", the resolved object will be simply {user: "gleb"}
  */
  getUserMetadata (key: string, bucket: string, s3: S3): Promise<S3.Metadata> {
    return new Promise((resole, reject) => {
      debug('getting user metadata from %s %s', bucket, key)

      s3.headObject({
        Bucket: bucket,
        Key: key
      }, (err, data) => {
        if (err) {
          return reject(err)
        }

        debug('user metadata')
        debug('%o', data.Metadata)
        resole(data.Metadata)
      })
    })
  }
}
