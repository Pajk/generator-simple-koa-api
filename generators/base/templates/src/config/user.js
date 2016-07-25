const path = require('path')

module.exports = {
    avatar_max_filesize: 1000000,
    avatar_upload_root: path.resolve(__dirname + '/../../public'),
    avatar_destination: '/image/avatar',
    avatar_url: '/image/avatar/',
    avatar_max_size_mb: 5
}