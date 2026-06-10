module.exports.paths = {



    "/pay/create-payment-intent" : {
      "post" : {
        "tags" : [ "Payment" ],
        "summary" : "Client init payment for order",
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
                  pk : 'pk_asdadasd',
                  clientSecret : 'asdadasdasd',
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
        "security" : [ {"bearerAuth" : [ ] } ]
      }
    },







}


