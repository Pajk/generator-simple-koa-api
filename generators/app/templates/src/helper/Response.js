'use strict'

var responseHelperFactory = function () {

  var helper = {}

  helper.format = function (data, pathname, pagination) {
    var limit = pagination.limit
    var offset = pagination.offset

    var output = {}

    if (data.length == limit) {

      var date_offset = data.length ? data[ data.length - 1 ].created_at : undefined

      var parts = pathname.split('?')

      var url_params = [
        (date_offset && !pagination.force_offset) ? ( 'timestamp_offset=' + date_offset.getTime() ) : ( 'offset=' + (limit + offset) ),
        'limit=' + limit
      ]

      if (parts[1] != undefined) {
        var queries = parts[1].split('&')
        url_params.push(queries.filter(function (s) { return s.match(/gender=/) != null ? true : false }).pop())
      }

      // remove older queries from pathname
      output.next_page = parts[0] + '?' + url_params.join('&')
    }

    output.data = data
    output.count = data.length

    return output
  }

  return helper
}

// @autoinject
module.exports.response = responseHelperFactory

