local http = require "resty.http"
local cjson = require "cjson"

local TokenHandler = {
  PRIORITY = 1000,
  VERSION = "1.0",
}

function TokenHandler:access(conf)
  local auth_header = kong.request.get_header("Authorization")
  if not auth_header then
    return kong.response.exit(401, { message = "Missing Authorization header" })
  end

  local client = http.new()
  local res, err = client:request_uri(conf.auth_url, {
    method = "GET",
    headers = {
      ["Authorization"] = auth_header,
      ["Content-Type"] = "application/json",
    },
    keepalive_timeout = 60,
    keepalive_pool = 10
  })

  if not res then
    kong.log.err("Failed to call auth service: ", err)
    return kong.response.exit(500, { message = "Internal Server Error" })
  end

  if res.status ~= 200 then
    return kong.response.exit(401, { message = "Unauthorized" })
  end

  local body = cjson.decode(res.body)
  if body and body.userId then
    kong.service.request.set_header("X-User-Id", body.userId)
  else
    return kong.response.exit(401, { message = "Invalid auth response" })
  end
end

return TokenHandler
