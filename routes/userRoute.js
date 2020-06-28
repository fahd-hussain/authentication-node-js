const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./public/images/")
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname)
        // new Date().toISOString() +
    }
})

const fileFilter = (req, file, callback) => {
    if (file.mimetype === "image/png") callback(null, true)
    else callback("File extension does not match", false)
}
const upload = multer({ 
    storage: storage, 
    limits: {
    fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const bodyParser = require("body-parser");
const User = require("../models/user");

const passport = require("passport");
const authenticate = require("../middlewares/authenticate");
const validator = require("../middlewares/validator");

router.use(bodyParser.json());

/* GET users listing. */
/* Only for Admin */
router.get("/", authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find({})
        .then(
            (users) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(users);
            },
            (err) => next(err),
        )
        .catch((err) => next(err));
});

/* User panel */
router.post(
    "/signup",
    validator.checkBodyContains("firstname", "lastname", "username", "gender", "password", "password2"),
    validator.checkBodyNotEmpty("firstname", "lastname", "username", "gender", "password"),
    validator.checkBodyValidString("firstname", "lastname", "gender"),
    validator.checkBodyMinValue(3, "firstname", "lastname", "username"),
    validator.checkBodyMinValue(4, "gender"),
    validator.checkBodyMinValue(6, "password"),
    validator.checkBodyMaxValue(30, "firstname", "lastname", "username", "password"),
    validator.checkBodyMaxValue(6, "gender"),
    validator.checkEmailValid,
    validator.checkGenderValid,
    validator.checkPasswordsMatch,
    (req, res, next) => {
        User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ err: err });
            } else {
                if (req.body.firstname) user.firstname = req.body.firstname;
                if (req.body.lastname) user.lastname = req.body.lastname;
                if (req.body.gender) user.gender = req.body.gender;
                console.log(user);
                user.save((err, user) => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.json({ err: err });
                        return;
                    }
                    passport.authenticate("local")(req, res, () => {
                        const token = authenticate.getToken({ _id: req.user._id });
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json({ success: true, status: "Registration Successful!", token });
                    });
                });
            }
        });
    },
);

router.post(
    "/login",
    validator.checkBodyContains("username", "password"),
    validator.checkBodyNotEmpty("username", "password"),
    validator.checkEmailValid,
    (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) return next(err);

            if (!user) {
                res.statusCode = 401;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: false, status: "Login Unsuccessful!", err: info });
            }
            req.logIn(user, (err) => {
                if (err) {
                    res.statusCode = 401;
                    res.setHeader("Content-Type", "application/json");
                    res.json({
                        success: false,
                        status: "Login Unsuccessful!",
                        err: "Could not log in user!",
                    });
                }

                const token = authenticate.getToken({ _id: req.user._id });
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: true, status: "Login Successful!", token: token });
            });
        })(req, res, next);
    },
);

router.get("/logout", (req, res) => {
    req.logout();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, status: "Logout Successful!", token: null });
});

router.get("/profile", (req, res) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            return res.json({ status: "JWT invalid!", success: false, err: info });
        } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({ status: "JWT valid!", success: true, user: user });
        }
    })(req, res);
});

router.post("/profilePicture", authenticate.verifyUser, upload.single("profilePicture"), (req, res, next) => {
    console.log(req);

    const picturePath = req.file.path;

    User.findByIdAndUpdate(
        req.user._id,
        {
            "profilePicture": picturePath,
        },
        { new: true },
    )
        .then(
            (User) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(User);
            },
            (err) => next(err),
        )
        .catch((err) => next(err));
});

module.exports = router;
