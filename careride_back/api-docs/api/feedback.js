

module.exports.paths = {

    "/feedback" : {
      "post" : {
        "tags" : [ "System" ],
        "summary" : "feedback form",
        "requestBody" : {
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  email: {type: "string", minLength: 3, maxLength: 32, example: "wasek@mm.cc" },
                  message: {type: "string", minLength: 3, maxLength: 512, example: "my message" },
                  token: {type: "string", minLength: 3, maxLength: 250, example: "asdasdadasd" },
                }
              }
            }
          }
        },
        "responses" : {
          "200" : {
            "description" : "Success auth",
            "content" : {
              "application/json" : {
                "example" : {
                  "result" : 1,
                  "client_list" : {
                  }
                }
              }
            }
          },
          "400" : {
            "description" : "Invalid input data",
            "content" : {
              "application/json" : {
                "example" : {
                  "result" : 0,
                  "error" : "NO_PERMISSION",
                }
              }
            }
          }
        },
      }
    },








}


