

module.exports.paths = {

    "/vendor/order/list" : {
      "post" : {
        "tags" : [ "VendorOrder" ],
        "summary" : "Vendor order list [ Vendor ]",
        "requestBody" : {
          description: "status: 0-new,  1=accepted,  3=work",
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  page:   {type: "integer", example: 0 },
                  onpage:   {type: "integer", example: 20 },
                  id:   {type: "integer", example: 0 },
                  status:   {type: "integer", example: 0 },
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
                  "vendorlist" : [
                  ]
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


    "/vendor/order/info" : {
      "post" : {
        tags : [ "VendorOrder" ],
        summary : "Order detail information [ Vendor ]",
        requestBody : {
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  "id" :  {type: "integer", example: 0 },
                }
              }
            }
          }
        },
        "responses" : {
          "200" : {
            content: {
              "application/json" : {
                example : {
                  result : 1,
                  order : {},
                  carlist: {},
                  driverlist: {},
                }
              }
            }
          },
          "400" : {
            "content" : {
              "application/json" : {
                "example" : {
                  result : 0,
                  error : "NO_PERMISSION",
                }
              }
            }
          }
        },
        security : [ {"bearerAuth" : [ ] } ]
      },
    },

    "/vendor/order/accept" : {
      "post" : {
        "tags" : [ "VendorOrder" ],
        "summary" : "Vendor accept order [ Vendor ]",
        "requestBody" : {
          description: "accept: 1-accept, 2-reject",
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  order_id:   {type: "integer", example: 0 },
                  accept:   {type: "integer", example: 1 },
                  car_id:   {type: "integer", example: 0 },
                  driver_id:   {type: "integer", example: 0 },
                  reason : {type : "string", maxLength: 64, example : "wait 15 min" },
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

    "/vendor/order/cancel" : {
      "post" : {
        "tags" : [ "VendorOrder" ],
        "summary" : "Vendor cancel the active order [ Vendor ]",
        "requestBody" : {
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  order_id:   {type: "integer", example: 0 },
                  reason : {type : "string", maxLength: 64, example : "" },
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


    "/vendor/order/history" : {
      "post" : {
        "tags" : [ "VendorOrder" ],
        "summary" : "Vendor order history",
        "requestBody" : {
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  page :      {type: "integer", example: 0 },
                  onpage :    {type: "integer", example: 20 },
                  status :    {type: "integer", example: 0 },
                  car_plate : {type: "string", example: "" },
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


    "/vendor/order/change/readed" : {
      "post" : {
        "tags" : [ "VendorOrder" ],
        "summary" : "Order change confirmation of reading [ Vendor ]",
        "requestBody" : {
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  order_id:   {type: "array", example: [1,2,3] },
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



}


