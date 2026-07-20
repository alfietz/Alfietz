import Hashids from 'hashids'

const hashids = new Hashids('alfietz-product-hash', 4)

export function encodeId(id) {
  return hashids.encode(Number(id))
}

export function decodeId(hash) {
  const decoded = hashids.decode(String(hash))
  return decoded.length > 0 ? decoded[0] : null
}
