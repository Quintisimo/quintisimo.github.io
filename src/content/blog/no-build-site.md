---
title: "No Build Site"
description: "Writing new websites the old fashion way"
pubDate: "Oct 24 2020"
heroImage: "./assets/no-build-site.jpg"
---

I needed to build a new react site so I fired up [creat-react-app](https://github.com/facebook/create-react-app) in my terminal. While I was waiting for all those node modules to install, I started reminiscing about the old days where you didn't need fancy jsx and 1000 line bundle.js file just to build a Hello World site. Now don't get me wrong I love the ease of use of npm and all the luxuries it provides. The main thing that annoys me is waiting for the project to rebuild after every change. Now I have heard about [snowpack](https://github.com/snowpackjs/snowpack) and how it improves on other bundlers, but I started to wonder if it is possible to write a full stack NodeJS and React application without a build step. This is what I came up with.

**DISCLAIMER - Please do not use this in production. This is more of a proof of concept.**

## ES Modules in Node

ES modules have been fully enabled in [node since version 12](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html) as long as the file ends in `.mjs` instead of `.js` (**Note**: The feature is still considered experimental). This allows us to use full ES6 syntax import and export syntax without needing any compilation!!!

Here's the code I came up with for a minimal server:

```javascript
import { resolve, join } from "path";
import fastify from "fastify";
import serve from "fastify-static";
import s from "socket.io";

const app = fastify();
const client = join(resolve(), "client");
app.register(serve, { root: client });

const io = s(app.server);
let socket = null;

io.on("connection", (soc) => {
  console.log("Connected to client");
  socket = soc;
});

app.listen(3000);
```

One thing to note is that in `.mjs` files global variables like `__dirname` and `__filename` are not available. The functions from the path module can be used to produce their values.

## ES Modules on the Client

[Look at the current support,](https://caniuse.com/?search=JavaScript%20modules%20via%20script%20tag) we can see that 93% of users can run es modules natively in their browser.

##JSX but not really
Once you have discovered the wonders of [React](https://github.com/facebook/react) and [JSX](https://reactjs.org/docs/introducing-jsx.html) no one really wants to go back to writing plane old HTML, JS and CSS. So how can we use React in the browser without compiling anything?

Well the problem here isn't React, it's JSX. The browser does not understand it. So all we need to do is to write React without JSX, simple. Well if you have ever looked at [React code without JSX](https://reactjs.org/docs/react-without-jsx.html) you would know it is annoying to write and difficult to understand at a glance.

So what do we do???

We leverage the amazing work done by the creator of [preact](https://github.com/preactjs/preact) and use the package [htm](https://github.com/developit/htm). It uses tag functions to give us near identical syntax to JSX with some minor caveats. This library and many others can be directly loaded using an import from a CDN. The CDN I chose in this case was [SkyPack](https://www.skypack.dev). It is maintained by the same people that make [snowpack](https://github.com/snowpackjs/snowpack)

Ok confession time. I did say that I was going to use React before but in the end I went with Preact because of two reasons. Firstly it had a [higher package score](https://www.skypack.dev/view/preact) on SpyPack compared to [React's score](https://www.skypack.dev/view/react). And secondly because both the framework and renderer were bundled in one package, I wouldn't have to load multiple packages over the network which in React's case would be the actual React library and React-DOM.

Here's what a component looks like:

```javascript
import { html, useState, useEffect, useCallback, css, cx } from "../imports.js";

const center = css`
  text-align: center;
  font-size: 40px;
`;

const red = css`
  color: red;
`;

const grid = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  height: 40px;

  & > button {
    outline: none;
    border: none;
    background: orangered;
    color: white;
    border-radius: 5px;
    font-size: 30px;
  }
`;

export default function App() {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [start, setStart] = useState(false);

  const reset = useCallback(() => {
    setStart(false);
    setSeconds(0);
    setMinutes(0);
  }, []);

  useEffect(() => {
    let interval = null;
    if (start) {
      interval = setInterval(() => {
        if (seconds < 60) {
          setSeconds((prev) => prev + 1);
        } else {
          setMinutes((prev) => prev + 1);
          setSeconds(0);
        }
      }, 1000);
    }
    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [seconds, start]);

  return html`<div>
    <p class=${cx({ [center]: true, [red]: start })}>
      Timer${" "} ${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}
    </p>

    <div class=${grid}>
      <button onClick=${() => setStart((prev) => !prev)}>
        ${start ? "Stop" : "Start"}
      </button>
      <button onClick=${reset}>Reset</button>
    </div>
  </div>`;
}
```

To centralise all the network imports, I created a file called `imports.js` and then re-exported all the modules that I needed. This means that if I ever need to change a CDN link of a package I only have to change it in one place.

## Developer Comforts

Everyone loves auto-reloading on changes during development. No one wants to start and stop their application whenever they make change. So how can we accomplish this. For the server this is easy we can just use a package. I ended up using [Nodemand](https://github.com/makeflow/nodemand#readme) because it was the only one I found that supported es modules. The client side implementation was a bit more challenging.

So what I came up with was this:

### Server

```javascript
if (process.env.NODE_ENV !== "production") {
  import("chokidar").then((c) => {
    const watcher = c.default.watch(client);
    watcher.on("change", () => {
      console.log("Reloading");
      if (socket !== null) socket.emit("reload");
    });
  });
}
```

### Client

```html
<script>
  // reload client on file change
  const socket = io();
  socket.on("reload", () => window.location.reload());
</script>
```

So during development the server watches the client folder and if any changes are detected a socket message is emitted. When the client received the message it would reload the page. I don't particularly like this implementation of client side reload, so if you have a better idea I would definitely like to hear them in the comments.

The project can be found on GitHub. Feel free to play around with it.

<script src="https://tarptaeya.github.io/repo-card/repo-card.js"></script>
<div class="repo-card" data-repo="quintisimo/no-build" data-theme="dark-theme"></div>
