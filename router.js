const url = require('url')
const { v4: uuidv4 } = require('uuid')
const { PATH, httpStatusCodes: statusCodes } = require('./config')
const { data: todoData } = require('./data/default')
const isRouterError = require('./helper/checkRouteError')
const { getReqData, findTargetIndex } = require('./helper/utils')
const { errorHandler, successHandler } = require('./helper/responseHandler')

const todoRoute = async (req, res) => {
  const { query, pathname } = url.parse(req.url, true)
  const splitUrl = pathname.split('/').filter(e => e)
  console.log('url query: ', query)
  console.log('req.url: ', pathname)
  console.log('splitUrl: ', splitUrl)

  if (isRouterError(req, PATH)) {
    errorHandler(
      res,
      statusCodes.NOT_FOUND,
      '404 not found, 請求路徑錯誤'
    )
    return
  }

  const body = await getReqData(req)

  switch (req.method) {
    case 'GET':
      if (splitUrl.length === 2) {
        const targetTodoIndex = findTargetIndex(todoData, splitUrl[1])
        if (targetTodoIndex !== -1 && Object.keys(query).length === 0) {
          successHandler(
            res,
            todoData[targetTodoIndex],
          )
        } else if (Object.keys(query).length !== 0) {
          errorHandler(
            res,
            statusCodes.NOT_FOUND,
            '請輸入正確路徑'
          )
        } else {
          errorHandler(
            res,
            statusCodes.NOT_FOUND,
            '無此待辦事項'
          )
        }
      } else if (query.complete) {
        const complete = query.complete === 'false' ? false : true
        const completeTodo = todoData.filter(todo => todo.complete === complete)
        successHandler(res, completeTodo)
      } else {
        successHandler(res, todoData)
      }
      break

    case 'POST':
      try {
        const content = JSON.parse(body).content
        if (content) {
          todoData.push({
            id: uuidv4(),
            content,
            complete: false,
          })
          successHandler(
            res,
            todoData
          )
        } else {
          errorHandler(
            res,
            statusCodes.BAD_REQUEST,
            '請填寫正確 content 內容'
          )
        }
      } catch (error) {
        console.error('TypeError: ', error)
        errorHandler(
          res,
          statusCodes.BAD_REQUEST,
          '欄位未填寫正確'
        )
      }
      break

    case 'PATCH':
      try {
        // 判斷 Patch 請求是否有 id
        if (splitUrl.length === 2) {
          let data = null
          if (body) {
            data = JSON.parse(body)
          }

          const updateTodoIndex = findTargetIndex(todoData, splitUrl[1])

          // 判斷是否找到此筆待辦
          if (updateTodoIndex !== -1) {
            // 若有 complete query
            if (query.complete) {
              todoData[updateTodoIndex].complete = query.complete === 'false' ? false : true
            }

            // 若有 body content
            if (data?.content) {
              todoData[updateTodoIndex].content = data.content
            }

            // 如果都沒有
            if (!query.complete && !Object.keys(data).includes('content')) {
              errorHandler(
                res,
                statusCodes.BAD_REQUEST,
                '請輸入正確內容'
              )
              return
            }

            successHandler(
              res,
              todoData,
              '更新成功'
            )
          } else {
            errorHandler(
              res,
              statusCodes.NOT_FOUND,
              '無此筆待辦事項'
            )
          }
        } else {
          errorHandler(
            res,
            statusCodes.BAD_REQUEST,
            '請輸入正確內容'
          )
        }
      } catch (error) {
        console.error('TypeError: ', error)
        errorHandler(
          res,
          statusCodes.BAD_REQUEST,
          '欄位未填寫正確'
        )
      }
      break

    case 'DELETE':
      if (pathname === PATH) {
        todoData.length = 0
        successHandler(
          res,
          todoData,
          '已清空所有待辦事項'
        )
      }
      else if (pathname !== PATH && splitUrl.length === 2) {
        const deleteTodoIndex = findTargetIndex(todoData, splitUrl[1])

        if (deleteTodoIndex !== -1) {
          const deleteContent = todoData[deleteTodoIndex].content
          todoData.splice(deleteTodoIndex, 1)
          successHandler(
            res,
            todoData,
            `刪除一筆待辦事項: ${deleteContent}`
          )
        } else {
          errorHandler(
            res,
            statusCodes.NOT_FOUND,
            '無此筆待辦事項'
          )
        }
      } else {
        errorHandler(
          res,
          statusCodes.BAD_REQUEST,
          '欄位未填寫正確'
        )
      }
      break

    case 'OPTIONS':
      successHandler(res)
      break

    default:
      errorHandler(
        res,
        statusCodes.NOT_FOUND,
        '404 not found'
      )
      break
  }
}

module.exports = todoRoute