let _ctx_field
let _request_timeout

let _requests_in_flight = {}
let _ctx_count = 0

function init(opts) {
    opts = opts || {}
    _ctx_field = opts.ctx_field || 'cmd_ctx'
    _request_timeout = opts._request_timeout || 10000
}

function request(ws, req, callback) {
    _ctx_count++
    req[_ctx_field] = _ctx_count
    ws.send(JSON.stringify(req))

    let timeout_id = setTimeout(()=>{
        delete _requests_in_flight[_ctx_count]
        callback({
            code: 100,
            message: 'Request timed out',
        })
    }, _request_timeout)

    _requests_in_flight[_ctx_count] = [timeout_id, callback]
}


function request_async(ws, req) {
    return new Promise((resolve, reject) => {
        request(ws, req, (err, res) => {
            if (err) reject(err)
            else resolve(res)
        })
    })
}

function process_message(msg) {
    let ctx = _requests_in_flight[msg[_ctx_field]]
    if (!ctx) {
        return false
    }

    clearTimeout(ctx[0])
    delete _requests_in_flight[msg[_ctx_field]]
    delete msg[_ctx_field]

    ctx[1](null, msg)

    return true
}

function socket_closed() {
    for (let key in _requests_in_flight) {
        let ctx = _requests_in_flight[key]
        clearTimeout(ctx[0])
        ctx[1]({
            code: 101,
            message: 'Connection terminated',
        })
    }
    _requests_in_flight = {}
}

module.exports = {
    init,
    request,
    request_async,
    process_message,
    socket_closed,
}
