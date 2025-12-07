import express from "express";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || 3000;

// میدلور برای لاگ گرفتن
app.use(morgan("combined"));

// ذخیره‌سازی تعداد تلاش‌های لاگین برای هر آی‌پی
const loginAttempts = {};

// برای اینکه بتونیم از body در POST استفاده کنیم
app.use(express.urlencoded({ extended: true }));

//  روت GET برای نمایش فرم لاگین (رندر به این نیاز داشت) 
app.get("/login", (req, res) => {
    res.send(`
        <h2>Login Test Form</h2>
        <form method="POST" action="/login">
            <input name="username" placeholder="username" />
            <input name="password" placeholder="password" type="password" />
            <button type="submit">Send Login</button>
        </form>
    `);
});

// روت لاگین برای تست حمله
app.post("/login", (req, res) => {
    const ip = req.ip;

    // بررسی تعداد تلاش‌ها برای این آی‌پی
    if (!loginAttempts[ip]) {
        loginAttempts[ip] = 1;
    } else {
        loginAttempts[ip]++;
    }

    console.log(` تعداد تلاش‌های IP ${ip}: ${loginAttempts[ip]}`);

    // اگر تعداد تلاش‌ها بیش از پنج بار شد، بلاک کن
    if (loginAttempts[ip] > 5) {

        setTimeout(() => {
            delete loginAttempts[ip];
        }, 10 * 60 * 1000); // ده دقیقه

        console.log("🚨 هشدار: احتمال حمله brute-force");

        return res.status(429).send("Too many attempts! Blocked for 10 minutes.");
    }

    // همیشه لاگین رو fail می‌کنیم چون فقط تست هست
    res.status(401).send("Login failed (test mode)");
});

// روت اصلی برای نمایش وضعیت سرور
app.get("/", (req, res) => {
    res.send("Server is running… go to /login with POST to test attacks.");
});

// شروع به کار سرور
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
