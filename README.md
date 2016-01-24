# Sparc API

This is the API for Sparc.

## Endpoints

1. `/user/update`
2. `/user/info`
3. `/user/addimage`

### PUT /user/update

Create or update a user's `name` based on its `id`

#### Parameters

Parameter | Type | Description | Example | Note
----- | ----- | ----- | ----- | -----
`id` | String | the id of the user | `u123` | must be unique
`name` | String | the name of the user | `Bob` |

#### Example Call

Request:
```bash
$ curl -H "Content-Type: application/json" -X PUT -d '{"id":"user1","name":"test1"}' http://localhost:8000/user/update
```

Response:
```json
{"data":{"name":"test1"}}
```

### GET /user/info/name

Gets a user's `name` by its `id`.

#### Parameters

Parameter | Type | Description | Example | Note
----- | ----- | ----- | ----- | -----
`id` | String | the id of the user | `u123` | must be unique

#### Example Call

Request:
```bash
$ curl -H "Content-Type: application/json" -X GET -d '{"id":"user1"}' http://localhost:8000/user/info/name
```

Response:
```json
{"data":{"name":"test1"}}
```

### GET /user/info/tags

Gets a user's `tags` by its `id`.

#### Parameters

Parameter | Type | Description | Example | Note
----- | ----- | ----- | ----- | -----
`id` | String | the id of the user | `u123` | must be unique

#### Example Call

Request:
```bash
$ curl -H "Content-Type: application/json" -X GET -d '{"id":"user1"}' http://localhost:8000/user/info/tags
```

Response:
```json
{
   "data":[
      {
         "name":"moon",
         "prob_index":0.9931754469871521,
         "total_pics":3,
         "total_prob":2.9795263409614563
      },
      {
         "name":"abstract",
         "prob_index":0.9833341240882874,
         "total_pics":3,
         "total_prob":2.950002372264862
      },
      {
         "name":"no person",
         "prob_index":0.9832662343978882,
         "total_pics":3,
         "total_prob":2.9497987031936646
      }
   ]
}
```


### GET /user/info/tags

Adds a image to the user's profile.

#### Parameters

Parameter | Type | Description | Example | Note
----- | ----- | ----- | ----- | -----
`id` | String | the id of the user | `u123` | must be unique
`image_data` | String | A `base64` encoded String containing the image (without prefixes) | `R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==` |

#### Example Call

Request:
```bash
$ (echo -n '{"id":"user1","image_data":"R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="}') | curl -H "Content-Type: application/json" -d @-  http://localhost:8000/user/addimage
```

Response:
```json
{
   "data":{
      "image_data":"R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
      "tags":[
         {
            "name":"moon",
            "prob":0.9931754469871521
         },
         {
            "name":"abstract",
            "prob":0.9833341240882874
         },
         {
            "name":"no person",
            "prob":0.9832662343978882
         }
      ]
   }
}
```
