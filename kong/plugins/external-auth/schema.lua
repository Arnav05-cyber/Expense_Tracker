return {
  name = "external-auth",
  fields = {
    { config = {
        type = "record",
        fields = {
          { auth_url = { type = "string", required = true, default = "http://auth-service:9820/ping" } },
        },
      },
    },
  },
}
