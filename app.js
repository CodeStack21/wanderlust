if(process.env.NODE_ENV != "production"){
    require("dotenv").config()
}

const PORT = process.env.PORT || 8080;
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const path = require("path")
const ejsMate = require("ejs-mate") // use to help to create template
const ExpressError = require("./utils/ExpressError")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")

const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

const dbURL = process.env.ATLASDB_URL;
main()
    .then(() => {
        console.log("Connected to DB")
    })
    .catch((err) => {
        console.log(err)
    })

async function main() {
    await mongoose.connect(dbURL)
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname, "/public")))


const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24* 3600,
})

store.on("error",(err)=>{
    console.log("ERROR in MONGO SESSION STORE",err)
})

const sessionOption ={
    store,
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized: false,
    cookie :{
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionOption))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Set safe defaults so EJS templates never get "X is not defined"
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

app.get("/",(req,res)=>{
    res.redirect("/listings");
})

// Routes
app.use("/listings",listingRouter)
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter)


// splat --> wildcard --> anything on / that does not matches above route
app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"))
})

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const { statusCode = 500, message = "Something Went Wrong" } = err;

    return res.status(statusCode).render("error.ejs", { message });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});