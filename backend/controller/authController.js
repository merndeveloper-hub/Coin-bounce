const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");
const RefreshToken = require("../models/token");

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}$/;

const authController = {
  // Register User
  async register(req, res, next) {
    // 1. validate user input
    const userRegisterSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmPassword: Joi.ref("password"),
    });
    const { error } = userRegisterSchema.validate(req.body);
    // 2. if error in validatioin -> return error via middleware
    if (error) {
      return next(error);
    }

    //3. if email or username is already registered -> return an error
    const { username, name, email, password } = req.body;

    try {
      const emailInUse = await User.exists({ email });
      const usernameInUse = await User.exists({ username });

      if (emailInUse) {
        const error = {
          status: 409,
          message: "Email already registered, use another email",
        };
        return next(error);
      }
      if (usernameInUse) {
        const error = {
          status: 409,
          message: "Username already registered, use another username",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //4. passowrd hash
    const hashedPassword = await bcrypt.hash(password, 10);

    let accessToken;
    let refreshToken;
    let user;
    try {
      //5. store user data in db
      const userToRegister = new User({
        username: username,
        email: email,
        name: name,
        password: hashedPassword,
      });

      user = await userToRegister.save();

      //token generation
      accessToken = JWTService.signAccessToken({ _id: user._id }, "30m");

      refreshToken = JWTService.signRefreshToken({ _id: user._id }, "60m");
    } catch (error) {
      return next(error);
    }
    //6. respond send
    // store refersh token in db
    await JWTService.storeRefreshToken(refreshToken, user._id);

    // send token in cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    const userDto = new UserDTO(user);
    return res.status(201).json({ user: userDto, auth: true });
  },

  // Login User
  async login(req, res, next) {
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattern),
    });
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { username, password } = req.body;

    let user;
    try {
      user = await User.findOne(username);
      if (!user) {
        const error = {
          status: 401,
          message: "Invalid Username",
        };
        return next(error);
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: "Invalid Password",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    const accessToken = JWTService.signAccessToken({ _id: user._id }, "30m");
    const refreshToken = JWTService.signRefreshToken({ _id: user._id }, "60m");

    //update refresh token in database
    try {
      await RefreshToken.updateOne(
        {
          _id: user._id,
        },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }

    // send token in cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    const userDto = new UserDTO(user);
    return res.status(200).json({ user: userDto, auth: true });
  },

  async logout(req, res, next) {
    //1. delete refresh token from db
    const { refreshToken } = req.cookies;
    try {
      await RefreshToken.deleteOne({ token: refreshToken });
    } catch (error) {
      return next(error);
    }

    // delete cokkies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    //2. resoonse
    res.status(200).json({ user: null, auth: false });
  },

  async refresh(req, res, next) {
    //1. get refreshToken from cookies
    //2. verify rerehToken
    //3. geereate tokens
    //4. update db, return response

    const originalRefreshToken = req.cookies.refreshToken;

    let id;
    try {
      id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }

    try {
      const match = RefreshToken.findOne({
        _id: id,
        token: originalRefreshToken,
      });
      if (!match) {
        const error = {
          status: 401,
          message: "Unauthorized",
        };
        return next(error);
      }
    } catch (e) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }

    try {
      const accessToken = JWTService.signAccessToken({_id: id},'30m');
      const refreshToken = JWT.signRefreshToken({_id:id},'60m');
      await RefreshToken.updateOne({_id:id},{token: refreshToken});
      res.cookie('acccessToken', accessToken,{
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true
      });
      res.cookie('refreshToken', refreshToken,{
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true
      });
    } catch (e) {
      
      return next(e);
    }

    const user = await User.findOne({_id: id});
    const userDto = new DTO(user);
    return res.status(200).json({user: userDto, auth: true});
  },
};
module.exports = authController;
