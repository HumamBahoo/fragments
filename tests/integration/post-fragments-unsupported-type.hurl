# tests/integration/post-fragments-unsupported-type.hurl

# Authenticated POST /v1/fragments with unsupported type
########################################################
POST http://localhost:8080/v1/fragments
Content-Type: text/csv
[BasicAuth]
user1@email.com:password1
```
firstName,lastName
Humam,Bahoo
```

# 1. Response
# ############
HTTP/1.1 415

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
jsonpath "$.error.message" == "Unsupported content type"
