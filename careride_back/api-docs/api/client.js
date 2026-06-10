

module.exports.paths = {

    "/client/auth" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client authorization",
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


    "/client/signup" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client registration step 1",
        "requestBody" : {
        "content" : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "login" : {minLength: 5, type : "string", example : "8956235100" },
              }
            }
          }
        }
      },
        "responses" : {
          "200" : {
            "description" : "Success registration",
            "content" : {
              "application/json" : {
                "example" : {
                  result: 1,
                  user: { login: "80123213123" }
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
                  "error" : "LOGIN_USED",
                }
              }
            }
          }
        }
      }
    },


    "/client/signupcode" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client registration step 1 - ckeck sms code",
        "requestBody" : {
          "content" : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  login : {minLength: 6, type: "string", example: "8956235100" },
                  code : {minLength: 6, type: "string", example: "code" },
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


    "/client/signup2" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client registration step 2",
        "requestBody" : {
          "content" : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  first_name :    {type: "string", minLength: 1, maxLength: 32, example: "wasek" },
                  second_name :    {type: "string",               maxLength: 32, example: "sidorow" },
                  last_name :    {type: "string",               maxLength: 32, example: "batxkow" },
                  email :    {type: "string",               maxLength: 32, example: "wasek@mm.cc" },
                  facility_name :    {type: "string",               maxLength: 32, example: "wasek@mm.cc" },
                  password :    {type: "string", minLength: 6, maxLength: 30, example: "mypassword" },
                }
              }
            }
          }
        },
        "responses" : {
          "200" : {
            "description" : "Success registration",
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
                  "error" : "ACCESS_DENIED",
                }
              }
            }
          }
        },
        "security" : [ { "bearerAuth" : [ ] } ]
      }
    },


    "/client/forgot_password" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client forgot password",
        "requestBody" : {
        "content" : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "login" : {"minLength" : 5, "type" : "string", "example" : "8956235100" },
              }
            }
          }
        }
      },
        "responses" : {
          "200" : {
            "description" : "Success send sms",
            "content" : {
              "application/json" : {
                "example" : {
                  "result" : 1,
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
                  "error" : "NOT_FOUND",
                }
              }
            }
          }
        }
      }
    },


    "/client/password" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client check code for change password",
        "requestBody" : {
        "content" : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "login" : {"minLength" : 5, "type" : "string", "example" : "8956235100" },
                "code" : {"minLength" : 2, "type" : "string", "example" : "123456" },
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
                "example" : {
                  "result" : 1,
                  "reset_token": "asdadadasdad",
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
                  "error" : "WRONG_CODE",
                }
              }
            }
          }
        }
      },
      "put" : {
        "tags" : [ "Client" ],
        "summary" : "Client change password by reset_token",
        "requestBody" : {
        "content" : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "login" : {"minLength" : 5, "type" : "string", "example" : "8956235100" },
                "reset_token" : {"minLength" : 4, "type" : "string", "example" : "123456" },
                "password" : {"minLength" : 6, "maxLength" : 30, "type" : "string", "example" : "mypassword" },
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
                "example" : {
                  "result" : 1,
                  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
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
                  "error" : "WRONG_TOKEN",
                }
              }
            }
          }
        }
      }
    },



    "/client/profile" : {
      "get" : {
        "tags" : [ "Client" ],
        "summary" : "Client profile",
        "requestBody" : {
        },
        "responses" : {
          "200" : {
            content: {
              "application/json" : {
                example : {
                  result : 1,
                  user : { },
                  orderstatuses : [ {id: 25, status: 2}, {id: 33, status: 21} ],
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

      "post" : {
        tags : [ "Client" ],
        "summary" : "Client profile edit",
        "requestBody" : {
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  first_name :   {type: "string", minLength: 1, maxLength: 32, example: "wasek" },
                  second_name :  {type: "string",               maxLength: 32, example: "sidorow" },
                  last_name :    {type: "string",               maxLength: 32, example: "last_name" },
                  email :        {type: "string",               maxLength: 32, example: "wasek@mm.cc" },
                  facility_name :{type: "string",               maxLength: 32, example: "facility" },
                  address :      {type: "string",               maxLength: 32, example: "address" },
                  city :         {type: "string",               maxLength: 32, example: "city" },
                  state :        {type: "string",               maxLength: 32, example: "AU" },
                  zipcode:       {type: "integer", example: 0 },
                  gender :        {type: "string",               maxLength: 1, example: "F" },
                  datebirth:       {type: "integer", example: 19901010 },
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
                "example" : {
                  "result" : 1,
                  "user" : {
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
        "security" : [ { "bearerAuth" : [ ] } ]
      }
    },



    "/client/profile/change_password" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client change password",
        "requestBody" : {
        "content" : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "password" : {"minLength" : 6, "maxLength" : 30, "type" : "string", "example" : "mypassword" },
                "newpassword" : {"minLength" : 6, "maxLength" : 30, "type" : "string", "example" : "myNewpassword" },
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
                "example" : {
                  "result" : 1,
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
        "security" : [ { "bearerAuth" : [ ] } ]
      }
    },




    "/client/order/create" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Create order",
        "requestBody" : {
          description: 'whoride:      1=Me, 2=Patient <br>\
			  cartype: 1=Wheelchair, 2=Gurney <br>\
			  gender: F , M <br>\
			  escort: 1=Spouse, 2=Son, 3=Daughter, 4=Other <br>\
			  ',
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  vendor_ids :    {type: "array", items:{type: 'integer'}, example: [2] },
                  orderAt : {type: "string", minLength: 19, example: "2024-08-14T11:58:27.169Z" },
                  pfrom_addr : {type: "string", minLength: 3, maxLength: 120, example: "Boston str 12 / 3" },
                  pfrom_city : {type: "string",               maxLength: 32, example: "Boston, UK" },
                  pto_addr :   {type: "string", minLength: 3, maxLength: 120, example: "Great ave 10 / 3" },
                  pto_city :   {type: "string",               maxLength: 32, example: "Boston, UK" },
                  p_dat :      {
                    type : "object",
                    properties : {
                      city: {type: "string",   example: "Boston, UK" },
                      ets: {type: "string",   example: "object" },
                    }
                  },
                  distance :   {type: "number", example: 12.5},
                  whoride :    {type: "integer", example: 1 },
                  cartype :    {type: "integer", example: 1 },
                  weight :     {type: "number", example: 12.5},
                  height :     {type: "number", example: 25.2},
                  gender :     {type: "string",  maxLength: 1, example: "M" },
                  datebirth:   {type: "integer", example: 19901010 },
                  wheelchair:  {type: "integer", example: 0 },
                  escort:      {type: "integer", example: 0 },
                  roundtrip:   {type: "integer", example: 0 },
                  covtst:      {type: "integer", example: 0 },
                  contact :      {type: "string", maxLength: 16, example: "55-555-555", description: 'for order owner'  },
                  contact_first :  {type: "string", maxLength: 64,  example: "", description: 'for Patient' },
                  contact_last :   {type: "string", maxLength: 64,  example: "", description: 'for Patient' },
                  contact_phone :  {type: "string", maxLength: 16,  example: "55-555-555", description: 'for Patient' },
                  instruction :  {type: "string", maxLength: 16000, example: "text text text" },
                  services: {
                    type : "object",
                    properties : {
                      OXYGEN: {type: "integer", example: 0 },
                      STAIRS: {type: "integer", example: 1 },
                    }
                  },
                  utc_offset:  {type: "integer", example: -240 },
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
            "description" : "Invalid input data",
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
        "security" : [ { "bearerAuth" : [ ] } ]
      }
    },


    "/client/order/current" : {
      "get" : {
        "tags" : [ "Client" ],
        "summary" : "Client get current order",
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

      "delete" : {
        "tags" : [ "Client" ],
        "summary" : "Client cancel current order",
        "requestBody": {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {type: "integer", example: 0 },
                },
              }
            }
          }
        },
        "responses" : {
          "200" : {
            "description" : "Success",
            "content" : {
              "application/json" : {
                "example" : {
                  "result" : 1,
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
                  "error" : "NOT_FOUND",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      },

    },


    "/client/vendor/search" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client search a vendor to order",
        "requestBody" : {
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  orderAt : {type: "string", minLength: 19, example: "2024-08-14T11:58:27.169Z" },
                  page :    {type: "integer", example: 0 },
                  onpage :    {type: "integer", example: 20 },
                  pfrom_city : {type: "string",               maxLength: 32, example: "Boston, UK" },
                  pto_city :   {type: "string",               maxLength: 32, example: "Boston, UK" },
                  distance :   {type: "number", example: 12.5},
                  cartype :    {type: "integer", example: 1 },
                  weight :     {type: "number", example: 12.5},
                  height :     {type: "number", example: 25.2},
                  wheelchair:  {type: "integer", example: 0 },
                  roundtrip:   {type: "integer", example: 0 },
                  services: {
                    type : "object",
                    properties : {
                      OXYGEN: {type: "integer", example: 0 },
                      STAIRS: {type: "integer", example: 1 },
                    }
                  },
                  utc_offset:  {type: "integer", example: -240 },
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
                  vendorlist : {
                  }
                }
              }
            }
          },
          "400" : {
            "description" : "Invalid input data",
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
      }
    },



    "/client/order/history" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client order history",
        "requestBody" : {
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  page :    {type: "integer", example: 0 },
                  onpage :    {type: "integer", example: 20 },
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



    "/client/order/rate" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client rate the order",
        "requestBody" : {
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  order_id :    {type: "integer", example: 0 },
                  rate :    {type: "integer", example: 4 },
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


//---------orderpreset
    "/client/orderpresets" : {
      "get" : {
        "tags" : [ "Client" ],
        "summary" : "Client list of presets",
        "requestBody" : {
        },
        "responses" : {
          "200" : {
            content: {
              "application/json" : {
                example : {
                  result : 1,
                  orderpreset_list : {
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

    "/client/orderpreset" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Create order preset",
        "requestBody" : {
          description: 'whoride:      1=Me, 2=Patient <br>\
			  cartype: 1=Wheelchair, 2=Gurney <br>\
			  gender: F , M <br>\
			  escort: 1=Spouse, 2=Son, 3=Daughter, 4=Other <br>\
			  ',
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  title :      {type: "string",  minLength: 1, maxLength: 32, example: "preset-title-1" },
                  whoride :    {type: "integer", example: 1 },
                  cartype :    {type: "integer", example: 1 },
                  weight :     {type: "number", example: 12.5},
                  height :     {type: "number", example: 25.2},
                  gender :     {type: "string",  maxLength: 1, example: "M" },
                  datebirth:   {type: "integer", example: 19901010 },
                  wheelchair:  {type: "integer", example: 0 },
                  escort:      {type: "integer", example: 0 },
                  contact :      {type: "string",               example: "55-555-555" },
                  instruction :  {type: "string",          example: "text text text" },
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
                  orderpreset : {
                  }
                }
              }
            }
          },
          "400" : {
            "description" : "Invalid input data",
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
        "security" : [ { "bearerAuth" : [ ] } ]
      },

      "put" : {
        "tags" : [ "Client" ],
        "summary" : "Client edit order preset",
        "requestBody" : {
          content : {
            "application/json" : {
              "schema" : {
                type : "object",
                properties : {
                  id :         {type: "integer", example: 1 },
                  title :      {type: "string",  minLength: 1, maxLength: 32, example: "preset-title-1" },
                  whoride :    {type: "integer", example: 1 },
                  cartype :    {type: "integer", example: 1 },
                  weight :     {type: "number", example: 12.5},
                  height :     {type: "number", example: 25.2},
                  gender :     {type: "string",  maxLength: 1, example: "M" },
                  datebirth:   {type: "integer", example: 19901010 },
                  wheelchair:  {type: "integer", example: 0 },
                  escort:      {type: "integer", example: 0 },
                  contact :      {type: "string",               example: "55-555-555" },
                  instruction :  {type: "string",          example: "text text text" },
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
                  orderpreset : {
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

      "delete" : {
        "tags" : [ "Client" ],
        "summary" : "Client delete order preset",
        "requestBody": {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {type: "integer", example: 0 },
                },
              }
            }
          }
        },
        "responses" : {
          "200" : {
            "description" : "Success",
            "content" : {
              "application/json" : {
                "example" : {
                  "result" : 1,
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
                  "error" : "NOT_FOUND",
                }
              }
            }
          }
        },
        "security" : [ {"bearerAuth" : [ ] } ]
      },

    },

    "/client/order/detach" : {
      "post" : {
        "tags" : [ "Client" ],
        "summary" : "Client detach last order from profile",
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


