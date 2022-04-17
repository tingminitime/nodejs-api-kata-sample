const isRouterError = (req, defaultPath) => {
  let result = true

  if (req.url.startsWith(defaultPath)) {
    switch (req.method) {
      case 'POST':
      case 'OPTIONS':
        if (req.url === defaultPath) result = false
        break

      case 'GET':
      case 'PATCH':
      case 'DELETE':
        result = false
        break

      default:
        break
    }
  }

  return result
}

module.exports = isRouterError