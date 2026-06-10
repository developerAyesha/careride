const apiDir = 'api';
const Doc = {
  "openapi" : "3.0.0",
  "info" : {
    "title" : "CareRide API",
    "description" : "rest api server\n",
    "version" : "1.0.0-s3"
  },
  "servers" : [ {
    "url" : "http://localhost:3000/api",
    "description" : "Localhost server"
  }, {
    "url" : "https://api.careride.iskytest.com/api",
    "description" : "Iskytest test server"
  }, {
    "url" : "https://api.careride.com/api",
    "description" : "prod"
  }],
  "paths": {},
  "components" : {
    "schemas" : {
    },
    "responses" : {
      "UnauthorizedError" : {
        "description" : "Access token is missing or invalid",
        "content" : {
          "application/json" : {
            "example" : {
              "success" : false,
              "error" : {
                "code" : 400,
                "message" : "Access token is missing or invalid"
              },
              "data" : { }
            }
          }
        }
      }
    },
    "requestBodies" : {
    },
    "securitySchemes" : {
      "bearerAuth" : {
        "type" : "http",
        "scheme" : "bearer",
        "bearerFormat" : "JWT"
      }
    }
  }
}

const normalizedPath = require('path').join(__dirname, apiDir);
require("fs").readdirSync(normalizedPath).forEach(function(filename) {
	if (filename.substr(-3) === '.js') {
		const ar = require('./' + apiDir + '/' + filename);
		if (ar.paths) {
			for (const name in ar.paths) {
				Doc.paths[name] = ar.paths[name];
			}
		}
	}
});


module.exports.Doc = Doc;