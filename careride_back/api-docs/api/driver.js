

module.exports.paths = {

    "/driver/auth" : {
      "post" : {
        "tags" : [ "Driver" ],
        "summary" : "Driver authorization",
        "requestBody" : {
        "content" : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "login" : {"minLength" : 5, "type" : "string", "example" : "8956235100" },
                "password" : {"minLength" : 5, "type" : "string", "example" : "passwordExample" }
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


    "/driver/profile" : {
      "get" : {
        "tags" : [ "Driver" ],
        "summary" : "Driver profile",
        "requestBody" : {
        },
        "responses" : {
          "200" : {
            content: {
              "application/json" : {
                example : {
                  result : 1,
                  user : { },
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


    "/driver/orders" : {
      "get" : {
        "tags" : [ "Driver" ],
        "summary" : "Driver get orders",
        "requestBody" : {
        },
        "responses" : {
          "200" : {
            content: {
              "application/json" : {
                example : {
                  result : 1,
                  order_list : {
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
                  "error" : "Token is invalid",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      },

    },

    "/driver/order/pickup" : {
      "post" : {
        "tags" : [ "Driver" ],
        "summary" : "Driver pick up the client",
        "requestBody" : {
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  order_id :    {type: "integer", example: 0 },
                }
              }
            }
          }
        },
        "responses" : {
          "200" : {
            "description" : "Success",
            "content" : {
              "application/json" : {
                example : {
                  result : 1,
                  order : {
                  }
                }
              }
            }
          },
          "400" : {
            "content" : {
              "application/json" : {
                example : {
                  result : 0,
                  error : "ACCESS_DENIED",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },


    "/driver/order/complete" : {
      "post" : {
        "tags" : [ "Driver" ],
        "summary" : "Driver complete the order",
        "requestBody" : {
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  order_id :    {type: "integer", example: 0 },
                }
              }
            }
          }
        },
        "responses" : {
          "200" : {
            "description" : "Success",
            "content" : {
              "application/json" : {
                example : {
                  result : 1,
                  order : {
                  }
                }
              }
            }
          },
          "400" : {
            "content" : {
              "application/json" : {
                example : {
                  result : 0,
                  error : "ACCESS_DENIED",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },


    "/driver/order/history" : {
      "post" : {
        "tags" : [ "Driver" ],
        "summary" : "Driver order history",
        "requestBody" : {
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  page :    {type: "integer", example: 0 },
                  onpage :    {type: "integer", example: 20 },
                  car_id:   {type: "integer", example: 0 },
                  car_plate: {type: "string", maxLength: 32, example: '' },
                  status:   {type: "integer", example: 0 },
                }
              }
            }
          }
        },
        "responses" : {
          "200" : {
            "description" : "Success",
            "content" : {
              "application/json" : {
                example : {
                  result : 1,
                  order_list : {
                  }
                }
              }
            }
          },
          "400" : {
            "content" : {
              "application/json" : {
                example : {
                  result : 0,
                  error : "ACCESS_DENIED",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },

    "/driver/order/detach" : {
      "post" : {
        "tags" : [ "Driver" ],
        "summary" : "Driver detach last order from profile",
        "requestBody" : {
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  order_id :    {type: "integer", example: 0 },
                }
              }
            }
          }
        },
        "responses" : {
          "200" : {
            "description" : "Success",
            "content" : {
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
                example : {
                  result : 0,
                  error : "ACCESS_DENIED",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },

}


