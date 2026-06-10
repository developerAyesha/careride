

module.exports.paths = {
    "/vendor/auth" : {
      "post" : {
        "tags" : [ "Vendor" ],
        "summary" : "Vendor authorization",
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


    "/vendor/signup" : {
      "post" : {
        "tags" : [ "Vendor" ],
        "summary" : "Vendor registration",
        "requestBody": {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  login: {type: "string", minLength: 5, maxLength: 32, example: '8956235100' },
                  passw: {type: "string", minLength: 5, maxLength: 32, example: 'passwordExample' },
                  company_name: {type: "string", minLength: 1, maxLength: 32, example: 'myCompany' },
                  first_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-1' },
                  second_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-2' },
                  last_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-3' },
                  address: {type: "string", minLength: 1, maxLength: 32, example: 'company address' },
                  city: {type: "string", minLength: 2, maxLength: 32, example: 'company city' },
                  state: {type: "string", maxLength: 2, example: 'CA' },
                  zipcode: {type: "integer", example: 0 },
                  email: {type: "string", maxLength: 32, example: '' },
                  costmt1: {type: "number", example: 2.2 },
                  costmt2: {type: "number", example: 0 },
                  baseprice1: {type: "number", example: 0.5 },
                  baseprice2: {type: "number", example: 0.5 },
                  'services[OXYGEN]': {type: "number", example: 5.5 },
                  'services[STAIRS]': {type: "number", example: 1.3 },
                  'overtimes[0][timefrom]': {type: "string", example: "19:00" },
                  'overtimes[0][timeto]': {type: "string", example: "06:00" },
                  'overtimes[0][price]': {type: "string", example: "15.50" },
                  filelicense: {
                    type: "array",
                    items: {
                      type: 'string',
                      format: 'binary',
                    }
                  }
                },
                required: ["login", 'passw', 'company_name', 'first_name', 'second_name', 'address', 'city', 'zipcode'],
              }
            }
          }
        },
        "responses" : {
          "200" : {
            "content" : {
              "application/json" : {
                "example" : {
                  result : 1,
                  user : {
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
                  "error" : "LOGIN_USED",
                }
              }
            }
          }
        },
      },
    },


    "/vendor/forgot_password" : {
      "post" : {
        "tags" : [ "Vendor" ],
        "summary" : "Vendor forgot password",
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


    "/vendor/password" : {
      "post" : {
        "tags" : [ "Vendor" ],
        "summary" : "Vendor check code for change password",
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
        "tags" : [ "Vendor" ],
        "summary" : "Vendor change password by reset_token",
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



    "/vendor/list" : {
      "post" : {
        "tags" : [ "Admin" ],
        "summary" : "Vendor list [ Admin ]",
        "requestBody" : {
          description: "status: 0-new,  1-approved, 2-declined",
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  page:   {type: "integer", example: 0 },
                  onpage:   {type: "integer", example: 20 },
                  id:   {type: "integer", example: 0 },
                  status:   {type: "integer", example: 0 },
                  block:   {type: "integer", example: 0 },
                  login: {type: "string", minLength: 3, maxLength: 32, example: "" },
                  company_name: {type: "string", maxLength: 32, example: "" },
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


    "/vendor/approve" : {
      "post" : {
        "tags" : [ "Admin" ],
        "summary" : "Vendor approve [ Admin ]",
        "requestBody" : {
          description: "approve: 0-new,  1-approve, 2-decline",
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  id:   {type: "integer", example: 0 },
                  approve:   {type: "integer", example: 1 },
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
                  "vendor" : {
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

    "/vendor/info" : {
      "post" : {
        tags : [ "Vendor" ],
        summary : "Vendor information [ * ]",
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
                  vendor : {
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
                  result : 0,
                  error : "NOT_FOUND",
                }
              }
            }
          }
        },
        security : [ {"bearerAuth" : [ ] } ]
      },
    },


    "/vendor/profile/" : {
      "post" : {
        "tags" : [ 'Vendor' ],
        "summary" : "Vendor edit profile [ Admin, Vendor ]",
        "requestBody": {
          description: "costmt1: cost mile Wheelchair, 2=Gurney",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {type: "integer", example: 0 },
                  block: {type: "integer", example: 0, default: '' },
                  company_name: {type: "string", minLength: 1, maxLength: 32, example: 'myCompany' },
                  first_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-1' },
                  second_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-2' },
                  last_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-3' },
                  address: {type: "string", minLength: 1, maxLength: 32, example: 'company address' },
                  city: {type: "string", minLength: 2, maxLength: 32, example: 'company city' },
                  state: {type: "string", maxLength: 2, example: 'CA' },
                  zipcode: {type: "integer", example: 0 },
                  email: {type: "string", maxLength: 32, example: '' },
                  costmt1: {type: "number", example: 2.2 },
                  costmt2: {type: "number", example: 0 },
                  baseprice1: {type: "number", example: 0.5 },
                  baseprice2: {type: "number", example: 0.5 },
                  services: {
                    type : "object",
                    properties : {
                      OXYGEN: {type: "number", example: 15.5 },
                      STAIRS: {type: "number", example: 3.3 },
                    }
                  },
                  overtimes: {
                    type : "array",
                    items: {
                      type : "object",
                      properties : {
                        timefrom: {type: "string", example: '16:00' },
                        timeto: {type: "string", example: '06:00' },
                        price: {type: "number", example: 15.5 },
                      }
                    },
                    example: [ {timefrom: '19:00', timeto: '06:00', price: 15.5}, {timefrom: '22:00', timeto: '06:00', price: 55.0}  ]
                  },
                },
                required: ["id"],
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
                  vendor : {
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
      },
    },

    "/vendor/profile/license/file" : {
      "post" : {
        tags : [ "Vendor" ],
        summary : "Vendor upload, delete license files",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  todelete: {
                    type : "array",
                    items: {
                      type : "integer",
                    },
                    example: [ 0, 3 ]
                  },
                  filelicense: {
                    type: "array",
                    items: {
                      type: 'string',
                      format: 'binary',
                    }
                  }
                },
              }
            }
          }
        },
        "responses" : {
          "200" : {
            "content" : {
              "application/json" : {
                "example" : {
                  result : 1,
                  vendor : {
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
        security : [ {"bearerAuth" : [ ] } ]
      },
    },


    "/vendor/profile/change_password" : {
      "post" : {
        "tags" : [ "Vendor" ],
        "summary" : "Vendor change password [ Vendor ]",
        "requestBody" : {
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  password : {"minLength" : 6, "maxLength" : 30, "type" : "string", "example" : "mypassword" },
                  newpassword : {"minLength" : 6, "maxLength" : 30, "type" : "string", "example" : "myNewpassword" },
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
            "description" : "Error",
            "content" : {
              "application/json" : {
                "example" : {
                  "result" : 0,
                  "error" : "WRONG_PASSWORD",
                }
              }
            }
          }
        },
        "security" : [ { "bearerAuth" : [ ] } ]
      }
    },

    "/vendor/stripeacc" : {
      "get" : {
        tags : [ "Vendor" ],
        summary : "Vendor get Stripe account links [ Vendor ]",
        responses : {
          "200" : {
            content: {
              "application/json" : {
                example : {
                  result : 1,
                  links : {
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
                  result : 0,
                  error : "NOT_FOUND",
                }
              }
            }
          }
        },
        security : [ {"bearerAuth" : [ ] } ]
      },
    },

    "/vendor/driver/list" : {
      "post" : {
        "tags" : [ "Admin", 'Vendor' ],
        "summary" : "Vendor drivers list [ Admin, Vendor ]",
        "requestBody" : {
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  page:   {type: "integer", example: 0 },
                  onpage:   {type: "integer", example: 20 },
                  id:   {type: "integer", example: 0 },
                  vendor_id:   {type: "integer", example: 0 },
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
                  "driverlist" : [
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


    "/vendor/driver/" : {
      "post" : {
        "tags" : [ "Admin", 'Vendor' ],
        "summary" : "Vendor add driver [ Admin, Vendor ]",
        "requestBody": {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  login: {type: "string", minLength: 5, maxLength: 32, example: '8956235100' },
                  passw: {type: "string", minLength: 5, maxLength: 32, example: 'passwordExample' },
                  vendor_id: {type: "integer", example: 0 },
                  first_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-1' },
                  second_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-2' },
                  last_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-3' },
                  filelicense: {type: "string", format: "binary" },
                },
                required: ["login", 'passw', 'vendor_id', 'first_name'],
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
                  "driver" : {
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
      },
      "put" : {
        "tags" : [ "Admin", 'Vendor' ],
        "summary" : "Vendor edit driver [ Admin, Vendor ]",
        "requestBody": {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  id: {type: "integer", example: 0 },
                  block: {type: "integer", example: 0 },
                  passw: {type: "string", minLength: 5, maxLength: 32, example: 'passwordExample' },
                  first_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-1' },
                  second_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-2' },
                  last_name: {type: "string", minLength: 1, maxLength: 32, example: 'name-3' },
                  filelicense: {type: "string", format: "binary" },
                },
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
                  "driver" : {
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
      },

      "delete" : {
        "tags" : [ "Admin", 'Vendor' ],
        "summary" : "Vendor delete driver [ Admin, Vendor ]",
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
      },

    },




    "/vendor/car/list" : {
      "post" : {
        "tags" : [ 'Vendor' ],
        "summary" : "Vendor cars list [ Admin, Vendor ]",
        "requestBody" : {
          description: "cartype: 1=Wheelchair, 2=Gurney",
          content : {
            "application/json" : {
              schema : {
                type : "object",
                properties : {
                  page:   {type: "integer", example: 0 },
                  onpage:   {type: "integer", example: 20 },
                  id:   {type: "integer", example: 0 },
                  vendor_id:   {type: "integer", example: 0 },
                  plate: {type: "string", maxLength: 32, example: '' },
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
                  "carlist" : [
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


    "/vendor/car/" : {
      "post" : {
        "tags" : [ 'Vendor' ],
        "summary" : "Vendor add car [ Admin, Vendor ]",
        "requestBody": {
          description: "cartype: 1=Wheelchair, 2=Gurney",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  vendor_id: {type: "integer", example: 0 },
                  model: {type: "string", minLength: 1, maxLength: 50, example: 'bmw' },
                  plate: {type: "string", minLength: 1, maxLength: 32, example: '123asd' },
                  color: {type: "string", minLength: 1, maxLength: 32, example: 'white' },
                  cartype: {type: "integer", example: 1 },
                  pricemile: {type: "numeric", example: 1 },
                  city: {type: "string", minLength: 1, maxLength: 32, example: 'Bossier City, LA' },
                  city_radius: {type: "numeric", example: 10 },
                  cities: {
                    type : "array",
                    items: {
                      type : "string",
                    },
                    example: [ 'Petersburg, VA', 'Alexandria, VA' ]
                  },
                },
                required: ["model", 'plate', 'color'],
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
                  "car" : {
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
      },
      "put" : {
        "tags" : [ 'Vendor' ],
        "summary" : "Vendor edit car [ Admin, Vendor ]",
        "requestBody": {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {type: "integer", example: 0 },
                  block: {type: "integer", example: 0 },
                  model: {type: "string", minLength: 1, maxLength: 50, example: 'bmw' },
                  plate: {type: "string", minLength: 1, maxLength: 32, example: '123asd' },
                  color: {type: "string", minLength: 1, maxLength: 32, example: 'white' },
                  cartype: {type: "integer", example: 1 },
                  pricemile: {type: "numeric", example: 1 },
                  city: {type: "string", minLength: 1, maxLength: 32, example: 'Bossier City, LA' },
                  city_radius: {type: "numeric", example: 10 },
                  cities: {
                    type : "array",
                    items: {
                      type : "string",
                    },
                    example: [ 'Petersburg, VA', 'Alexandria, VA' ]
                  },
                },
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
                  "car" : {
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
      },

      "delete" : {
        "tags" : [ 'Vendor' ],
        "summary" : "Vendor delete car [ Admin, Vendor ]",
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
      },

    },



}


