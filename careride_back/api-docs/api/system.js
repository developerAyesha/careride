
module.exports.paths = {

    "/system/opt" : {
      "get" : {
        tags : [ "System" ],
        summary : "System options",
        responses : {
          "200" : {
            content : {
              "application/json" : {
                example : {
                  result : 1,
                  opt: {
                    "STATES": []
                  }
                }
              }
            }
          },
          "400" : {
            "content" : {
              "application/json" : {
                "example" : {
                  "result" : 0,
                  "error" : "error",
                }
              }
            }
          }
        },
      },

    },

    "/system/storage/get" : {
      "post" : {
        tags : [ "System" ],
        summary : "dowlload file",
        "requestBody" : {
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  fname:   {type: "string", example: "vlic/1_1.png" },
                }
              }
            }
          }
        },
        responses : {
          "200" : {
            content : {
              "application/json" : {
                example : {
                  result : 1,
                }
              }
            }
          },
          "400" : {
            "content" : {
              "application/json" : {
                "example" : {
                  "result" : 0,
                  "error" : "error",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      },

    },


}


