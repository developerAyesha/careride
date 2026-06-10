

module.exports.paths = {
    "/admin/auth" : {
      "post" : {
        "tags" : [ "Admin" ],
        "summary" : "Admin authorization",
        "operationId" : "userAuth",
        "requestBody" : {
          description: "role: a=admin, v=vendor, d=driver, c=client",
          content : {
            "application/json" : {
              "schema" : {
                "type" : "object",
                "properties" : {
                  "login" :    {type: "string", minLength: 5, maxLength: 32, example: "8956235100" },
                  "password" : {type: "string", minLength: 5, maxLength: 32, example: "passwordExample" }
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
                  "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NDQwN",
                  "user" : {
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
                  "error" : "WRONG_AUTH",
                }
              }
            }
          }
        }
      }
    },



    "/client/list" : {
      "post" : {
        "tags" : [ "Admin" ],
        "summary" : "Client list [ Admin ]",
        "requestBody" : {
          description: "block: 0=normal, 1=block ",
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  page:   {type: "integer", example: 0 },
                  onpage:   {type: "integer", example: 20 },
                  id:   {type: "integer", example: 0 },
                  block:   {type: "integer", example: 0 },
                  login: {type: "string", minLength: 3, maxLength: 32, example: "" },
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
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },

    "/client/info" : {
      "post" : {
        "tags" : [ "Admin" ],
        "summary" : "Client info [ Admin ]",
        "requestBody" : {
          description: "block: 0=normal, 1=block ",
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  id:   {type: "integer", example: 0 },
                  block:   {type: "integer", example: 0 },
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
                  "user" : {
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
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },



    "/order/current" : {
      "post" : {
        "tags" : [ "Admin" ],
        "summary" : "Order list [ Admin ]",
        "requestBody" : {
          description: "status: 0-new,  1=accepted,  3=work,  10-complete,  20-cancel, 21-reject, 22-expired",
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  page:   {type: "integer", example: 0 },
                  onpage:   {type: "integer", example: 20 },
                  id:   {type: "integer", example: 0 },
                  status:   {type: "integer", example: 0 },
                  vendor_id:   {type: "integer", example: 0 },
                  client_id:   {type: "integer", example: 0 },
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
                  "order_list" : {
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
                  "error" : "NO_PERMISSION",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },

    "/order/history" : {
      "post" : {
        "tags" : [ "Admin" ],
        "summary" : "Order list [ Admin ]",
        "requestBody" : {
          description: "status: 0-new,  1=accepted,  3=work,  10-complete,  20-cancel, 21-reject, 22-expired",
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  page:   {type: "integer", example: 0 },
                  onpage:   {type: "integer", example: 20 },
                  id:   {type: "integer", example: 0 },
                  status:   {type: "integer", example: 0 },
                  vendor_id:   {type: "integer", example: 0 },
                  client_id:   {type: "integer", example: 0 },
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
                  "order_list" : {
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
                  "error" : "NO_PERMISSION",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },

    "/order/cancel" : {
      "post" : {
        "tags" : [ "Admin" ],
        "summary" : "Admin cancel the active order",
        "requestBody" : {
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  order_id:   {type: "integer", example: 0 },
                  capture_percent : {type : "integer", minimum: 0, maximum: 100, example: 20 },
                  reason : {type : "string", maxLength: 64, example: "" },
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
                  "order" : {
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
                  "error" : "NO_PERMISSION",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },



    "/admin/log" : {
      "post" : {
        tags : [ "Admin" ],
        summary : "log view [ Admin ]",
        requestBody : {
          description: "name: app, error, pay",
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  name: {type: "string", example: "app" },
                }
              }
            }
          }
        },
        responses : {
          "200" : {
            "description" : "Success auth",
            "content" : {
              "application/json" : {
                example : {
                  result : 1,
                  fsize: 1234124,
                  from: 0,
                  data : [],
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
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },



}


