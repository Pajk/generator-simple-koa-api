var paginationHelperFactory = function (config) {

  var helper = {}

  helper.extract = function* (next) {
    var limit = parseInt(this.query.limit) || config.pagination.max_per_page
    var page = parseInt(this.query.page) || 1
    var offset = parseInt(this.query.offset) || (page - 1) * limit || 0
    var timestamp_offset = parseInt(this.query.timestamp_offset)

    this.state = this.state || {}

    this.state.pagination = {
      limit: limit,
      offset: offset,
      timestamp_offset: timestamp_offset
    }

    yield next
  }

  return helper
}

// @autoinject
module.exports.pagination = paginationHelperFactory