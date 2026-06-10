

module.exports.paths = {

    "/profile" : {
      "get" : {
        "tags" : [ "Profile" ],
        "summary" : "get current session profile",
        "responses" : {
          "200" : {
            description: "",
            content: {
              "application/json" : {
                example : {
                  result : 1,
                  user : {
                  }
                }
              }
            }
          },
          "400" : {
            "description" : "Invalid session",
            "content" : {
              "application/json" : {
                "example" : {
                  "result" : 0,
                  "error" : "Token is invalid",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      },

    },










}


