const Koa = require("koa");
const cors = require("koa2-cors");
const Router = require("koa-router");
const router = new Router();

const { getFund, getFundExtraOptions } = require("./controllers/funds");
const { getGuiCache, setGuiCache } = require("./utils/cacheHandler");
const { fetchFundByApi } = require("./utils/fundApi");

const app = new Koa();

app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"],
    credentials: true,
    maxAge: 5,
  })
);

router
  .get("/", async (ctx, next) => {
    ctx.body = "This is the index page";
  })
  .get("/test", async () => {
    // ctx.body = JSON.stringify(await fetchFundByApi('110010'));
  })
  .get("/getFund", async (ctx, next) => {
    await getFund(ctx);
  })
  .get("/getFundExtraOptions", async (ctx, next) => {
    getFundExtraOptions(ctx);
  })
  .get("/getGuiCache", async (ctx, next) => {
    ctx.body = getGuiCache(ctx);
  })
  .get("/setGuiCache", async (ctx, next) => {
    const { data } = ctx.query;
    setGuiCache(data);
    ctx.body = "ok";
  });

app.use(router.routes()).use(router.allowedMethods());

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
