function getReqData(req) {
  return new Promise((resolve, reject) => {
    try {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => resolve(body))
    } catch (error) {
      reject(error)
    }
  })
}

function findTargetIndex(data = [], id) {
  return data.findIndex(item => item.id === id)
}

module.exports = { getReqData, findTargetIndex }