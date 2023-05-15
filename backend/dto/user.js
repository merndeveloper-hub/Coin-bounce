class UserDTO{
    constructor(user) {
        this._id = user._id,
        this._username = user.username,
        this.email = user.email
    }
}

module.exports = UserDTO;